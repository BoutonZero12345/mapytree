import { create } from 'zustand';
import { createScenarioSlice } from './scenarioSlice';
import { createBlockSlice } from './blockSlice';
import { createSyncSlice } from './syncSlice';
import { createFavoriteSlice } from './favoriteSlice';
import { 
    saveCachedPlace, 
    getAllFolders, 
    saveFolder, 
    deleteFolder, 
    getAllDates, 
    createNewDate, 
    deleteDatePlan, 
    updateDateName,
    loadDatePlan,
    saveDatePlan
} from '../../../services/db';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export const useDateStore = create((set, get) => ({
    ...createScenarioSlice(set, get),
    ...createBlockSlice(set, get),
    ...createSyncSlice(set, get),
    ...createFavoriteSlice(set, get),

    // NOUVEAU : Cache de session locale pour éviter les doubles appels Google Maps
    localPlacesCache: {},
    activePlaceDetails: null,

    setActivePlaceDetails: (place) => {
        if (!place) {
            set({ activePlaceDetails: null });
            return;
        }
        const state = get();
        const cached = state.localPlacesCache[place.placeId];
        if (cached) {
            set({ activePlaceDetails: { ...place, ...cached } });
        } else {
            set({ activePlaceDetails: place });
        }
    },

    fetchPlacePhotos: async (placeId) => {
        const state = get();
        const cached = state.localPlacesCache[placeId] || {};
        if (cached.photos) return; // Déjà chargées en cache de session!

        if (!window.google) return;

        try {
            const service = new window.google.maps.places.PlacesService(document.createElement('div'));
            const details = await new Promise((resolve, reject) => {
                service.getDetails({
                    placeId,
                    fields: ['photos']
                }, (res, status) => status === 'OK' ? resolve(res) : reject(status));
            });

            const photos = details && details.photos
                ? details.photos.slice(0, 30).map(p => p.getUrl({ maxWidth: 360 }))
                : [];
            const largePhotos = details && details.photos
                ? details.photos.slice(0, 30).map(p => p.getUrl({ maxWidth: 1200 }))
                : [];

            const updates = { photos, largePhotos };

            set((state) => {
                const currentCached = state.localPlacesCache[placeId] || {};
                const newCached = { ...currentCached, ...updates };
                
                const activeDetails = state.activePlaceDetails;
                const newActiveDetails = activeDetails && activeDetails.placeId === placeId
                    ? { ...activeDetails, ...updates }
                    : activeDetails;
                    
                return {
                    localPlacesCache: { ...state.localPlacesCache, [placeId]: newCached },
                    activePlaceDetails: newActiveDetails
                };
            });

            const updatedPlace = { ...state.activePlaceDetails, ...updates };
            await state.syncPlaceToFirestoreIfNeeded(placeId, updatedPlace);
        } catch (error) {
            console.error("Error fetching place photos:", error);
            set((state) => {
                const updates = { photos: [], largePhotos: [] };
                const currentCached = state.localPlacesCache[placeId] || {};
                const newCached = { ...currentCached, ...updates };
                const activeDetails = state.activePlaceDetails;
                const newActiveDetails = activeDetails && activeDetails.placeId === placeId
                    ? { ...activeDetails, ...updates }
                    : activeDetails;
                return {
                    localPlacesCache: { ...state.localPlacesCache, [placeId]: newCached },
                    activePlaceDetails: newActiveDetails
                };
            });
        }
    },

    fetchPlaceReviews: async (placeId) => {
        const state = get();
        const cached = state.localPlacesCache[placeId] || {};
        if (cached.reviews) return; // Déjà chargées!

        if (!window.google) return;

        try {
            const service = new window.google.maps.places.PlacesService(document.createElement('div'));
            const details = await new Promise((resolve, reject) => {
                service.getDetails({
                    placeId,
                    fields: ['reviews']
                }, (res, status) => status === 'OK' ? resolve(res) : reject(status));
            });

            const reviews = details && details.reviews
                ? details.reviews.slice(0, 100).map(r => ({
                    author: r.author_name,
                    rating: r.rating,
                    text: r.text,
                    time: r.relative_time_description,
                    avatar: r.profile_photo_url
                }))
                : [];

            const updates = { reviews };

            set((state) => {
                const currentCached = state.localPlacesCache[placeId] || {};
                const newCached = { ...currentCached, ...updates };
                
                const activeDetails = state.activePlaceDetails;
                const newActiveDetails = activeDetails && activeDetails.placeId === placeId
                    ? { ...activeDetails, ...updates }
                    : activeDetails;
                    
                return {
                    localPlacesCache: { ...state.localPlacesCache, [placeId]: newCached },
                    activePlaceDetails: newActiveDetails
                };
            });

            const updatedPlace = { ...state.activePlaceDetails, ...updates };
            await state.syncPlaceToFirestoreIfNeeded(placeId, updatedPlace);
        } catch (error) {
            console.error("Error fetching place reviews:", error);
            set((state) => {
                const updates = { reviews: [] };
                const currentCached = state.localPlacesCache[placeId] || {};
                const newCached = { ...currentCached, ...updates };
                const activeDetails = state.activePlaceDetails;
                const newActiveDetails = activeDetails && activeDetails.placeId === placeId
                    ? { ...activeDetails, ...updates }
                    : activeDetails;
                return {
                    localPlacesCache: { ...state.localPlacesCache, [placeId]: newCached },
                    activePlaceDetails: newActiveDetails
                };
            });
        }
    },

    syncPlaceToFirestoreIfNeeded: async (placeId, updatedPlace) => {
        const state = get();
        
        // 1. Condition favori
        const isFavorite = state.favorites.some(f => f.placeId === placeId);
        
        // 2. Condition >3 clics dans Firestore
        const clickRef = doc(db, 'places_click_counts', placeId);
        const clickSnap = await getDoc(clickRef);
        const clickCount = clickSnap.exists() ? (clickSnap.data().count || 0) : 0;
        
        if (isFavorite || clickCount >= 3) {
            await saveCachedPlace(placeId, updatedPlace);
            
            // Si c'est un favori, on met également à jour la collection favorites
            if (isFavorite) {
                const favorite = state.favorites.find(f => f.placeId === placeId);
                if (favorite) {
                    await state.updateFavorite(favorite.id, {
                        photos: updatedPlace.photos || null,
                        largePhotos: updatedPlace.largePhotos || null,
                        reviews: updatedPlace.reviews || null
                    });
                }
            }
        }
    },

    // --- GESTION DOSSIERS & PLANNINGS ---
    folders: [],
    dates: [],
    isLoadingFolders: false,
    isLoadingDates: false,

    loadFolders: async () => {
        set({ isLoadingFolders: true });
        try {
            const data = await getAllFolders();
            set({ folders: data || [], isLoadingFolders: false });
        } catch (e) {
            set({ isLoadingFolders: false });
        }
    },

    loadDates: async () => {
        set({ isLoadingDates: true });
        try {
            const data = await getAllDates();
            set({ dates: data || [], isLoadingDates: false });
        } catch (e) {
            set({ isLoadingDates: false });
        }
    },

    createFolder: async (name, color = '#3b82f6', parentFolderId = null) => {
        const id = crypto.randomUUID();
        const newFolder = {
            id,
            name,
            color,
            parentFolderId,
            createdAt: new Date().toISOString()
        };
        await saveFolder(id, newFolder);
        set((state) => ({ folders: [...state.folders, newFolder] }));
        return newFolder;
    },

    updateFolderState: async (id, updates) => {
        set((state) => {
            const updated = state.folders.map(f => f.id === id ? { ...f, ...updates } : f);
            const folder = updated.find(f => f.id === id);
            if (folder) {
                saveFolder(id, folder);
            }
            return { folders: updated };
        });
    },

    deleteFolderState: async (id) => {
        await deleteFolder(id);
        set((state) => {
            const updatedDates = state.dates.map(d => d.folderId === id ? { ...d, folderId: null } : d);
            state.dates.forEach(async (d) => {
                if (d.folderId === id) {
                    const currentData = await loadDatePlan(d.id);
                    if (currentData) {
                        await saveDatePlan(d.id, { ...currentData, folderId: null });
                    }
                }
            });
            return {
                folders: state.folders.filter(f => f.id !== id),
                dates: updatedDates
            };
        });
    },

    updateDateFolder: async (dateId, folderId) => {
        const currentData = await loadDatePlan(dateId);
        if (currentData) {
            await saveDatePlan(dateId, {
                ...currentData,
                folderId: folderId
            });
        }
        set((state) => ({
            dates: state.dates.map(d => d.id === dateId ? { ...d, folderId } : d)
        }));
    },

    togglePlanningFavorite: async (dateId) => {
        const currentData = await loadDatePlan(dateId);
        if (currentData) {
            const newFav = !currentData.isFavorite;
            await saveDatePlan(dateId, {
                ...currentData,
                isFavorite: newFav
            });
            set((state) => ({
                dates: state.dates.map(d => d.id === dateId ? { ...d, isFavorite: newFav } : d),
                isFavorite: state.currentDateId === dateId ? newFav : state.isFavorite
            }));
        }
    },

    createDatePlanning: async (name) => {
        const newDate = await createNewDate(name);
        if (newDate) {
            set((state) => ({
                dates: [newDate, ...state.dates]
            }));
        }
        return newDate;
    },

    deleteDatePlanning: async (id) => {
        await deleteDatePlan(id);
        set((state) => ({
            dates: state.dates.filter(d => d.id !== id)
        }));
    },

    updateDatePlanningName: async (id, newName) => {
        await updateDateName(id, newName);
        set((state) => ({
            dates: state.dates.map(d => d.id === id ? { ...d, name: newName } : d)
        }));
    }
}));