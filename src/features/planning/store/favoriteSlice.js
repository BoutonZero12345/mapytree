import { collection, getDocs, setDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { deleteCachedPlace } from '../../../services/db';

export const createFavoriteSlice = (set, get) => ({
    favorites: [],
    categories: [],
    isLoadingFavorites: false,

    loadFavorites: async () => {
        set({ isLoadingFavorites: true });
        try {
            // Load Favorites
            const favsSnapshot = await getDocs(collection(db, 'favorites'));
            const favs = [];
            favsSnapshot.forEach((doc) => {
                favs.push({ id: doc.id, ...doc.data() });
            });

            // Load Categories
            const catsSnapshot = await getDocs(collection(db, 'favorite_categories'));
            const cats = [];
            catsSnapshot.forEach((doc) => {
                cats.push({ id: doc.id, ...doc.data() });
            });

            set({ favorites: favs, categories: cats, isLoadingFavorites: false });
        } catch (error) {
            console.error("Error loading favorites/categories:", error);
            set({ isLoadingFavorites: false });
        }
    },

    addCategory: async (name) => {
        const id = crypto.randomUUID();
        const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];
        const color = colors[get().categories.length % colors.length];
        const newCat = { id, name, color };
        
        await setDoc(doc(db, 'favorite_categories', id), newCat);
        set((state) => ({ categories: [...state.categories, newCat] }));
    },

    deleteCategory: async (id) => {
        await deleteDoc(doc(db, 'favorite_categories', id));
        set((state) => ({
            categories: state.categories.filter(c => c.id !== id),
            // Reset category for favorites using it
            favorites: state.favorites.map(f => f.categoryId === id ? { ...f, categoryId: null } : f)
        }));
    },

    toggleFavorite: async (place) => {
        const state = get();
        const existingFav = state.favorites.find(f => (f.placeId && f.placeId === place.placeId) || (f.lat === place.lat && f.lng === place.lng));

        if (existingFav) {
            await deleteDoc(doc(db, 'favorites', existingFav.id));
            if (existingFav.placeId) {
                await deleteCachedPlace(existingFav.placeId); // Enlever les images stockées dans le cache
            }
            set({ favorites: state.favorites.filter(f => f.id !== existingFav.id) });
        } else {
            const favId = crypto.randomUUID();
            const newFav = {
                id: favId,
                placeId: place.placeId || null,
                name: place.name,
                address: place.address,
                lat: place.lat,
                lng: place.lng,
                durationMinutes: 60,
                budget: 0,
                notes: '',
                categoryId: null,
                createdAt: new Date().toISOString(),
                imageUrl: place.imageUrl || null,
                priceLevel: place.priceLevel || null,
                openingHours: place.openingHours || null,
                reviews: place.reviews || null,
                photos: place.photos || null
            };
            await setDoc(doc(db, 'favorites', favId), newFav);
            set({ favorites: [...state.favorites, newFav] });
        }
    },

    updateFavorite: async (id, updates) => {
        const favRef = doc(db, 'favorites', id);
        await updateDoc(favRef, updates);
        set((state) => ({
            favorites: state.favorites.map(f => f.id === id ? { ...f, ...updates } : f)
        }));
    },

    deleteFavorite: async (id) => {
        await deleteDoc(doc(db, 'favorites', id));
        set((state) => ({ favorites: state.favorites.filter(f => f.id !== id) }));
    }
});