import { collection, doc, setDoc, getDoc, getDocs, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const createNewDate = async (name) => {
    try {
        const docRef = await addDoc(collection(db, 'dates'), {
            name: name,
            createdAt: new Date().toISOString(),
            blocks: [],
            scenarios: [{ id: 'plan_a', name: 'Plan A' }]
        });
        return { id: docRef.id, name };
    } catch (error) { return null; }
};

export const getAllDates = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'dates'));
        const dates = [];
        querySnapshot.forEach((doc) => { dates.push({ id: doc.id, ...doc.data() }); });
        return dates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) { return []; }
};

export const saveDatePlan = async (id, data) => {
    try {
        const dateRef = doc(db, 'dates', id);
        await setDoc(dateRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
        return true;
    } catch (error) { return false; }
};

export const loadDatePlan = async (id) => {
    try {
        const dateRef = doc(db, 'dates', id);
        const docSnap = await getDoc(dateRef);
        if (docSnap.exists()) { return docSnap.data(); }
        return null;
    } catch (error) { return null; }
};

// --- NOUVEAU : GESTION DES SORTIES (DATES) ---
export const deleteDatePlan = async (id) => {
    try {
        await deleteDoc(doc(db, 'dates', id));
        return true;
    } catch (error) { return false; }
};

export const updateDateName = async (id, newName) => {
    try {
        await updateDoc(doc(db, 'dates', id), { name: newName });
        return true;
    } catch (error) { return false; }
};

// --- CACHE DES ROUTES ---
export const getCachedRoute = async (routeKey) => {
    try {
        const docSnap = await getDoc(doc(db, 'routes_cache', routeKey));
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) { return null; }
};

export const saveCachedRoute = async (routeKey, routeData) => {
    try { await setDoc(doc(db, 'routes_cache', routeKey), routeData); }
    catch (error) { console.error(error); }
};

// --- CACHE DES LIEUX (IMAGES, HORAIRES, PRIX, REVIEWS) ---
export const getCachedPlace = async (placeId) => {
    try {
        const docSnap = await getDoc(doc(db, 'places_cache', placeId));
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) { return null; }
};

export const saveCachedPlace = async (placeId, placeData) => {
    try {
        await setDoc(doc(db, 'places_cache', placeId), {
            ...placeData,
            cachedAt: new Date().toISOString()
        });
    } catch (error) { console.error(error); }
};

export const deleteCachedPlace = async (placeId) => {
    try {
        await deleteDoc(doc(db, 'places_cache', placeId));
    } catch (error) { console.error(error); }
};

export const incrementPlaceClickCount = async (placeId) => {
    try {
        const docRef = doc(db, 'places_click_counts', placeId);
        const docSnap = await getDoc(docRef);
        let count = 1;
        if (docSnap.exists()) {
            count = (docSnap.data().count || 0) + 1;
            await setDoc(docRef, { count }, { merge: true });
        } else {
            await setDoc(docRef, { count: 1 });
        }
        return count;
    } catch (error) {
        console.error("Error incrementing click count:", error);
        return 0;
    }
};

// --- GESTION DES DOSSIERS DE PLANNINGS ---
export const getAllFolders = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'planning_folders'));
        const folders = [];
        querySnapshot.forEach((doc) => {
            folders.push({ id: doc.id, ...doc.data() });
        });
        return folders;
    } catch (error) {
        console.error("Error getting folders:", error);
        return [];
    }
};

export const saveFolder = async (id, folderData) => {
    try {
        const folderRef = doc(db, 'planning_folders', id);
        await setDoc(folderRef, {
            ...folderData,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error saving folder:", error);
        return false;
    }
};

export const deleteFolder = async (id) => {
    try {
        await deleteDoc(doc(db, 'planning_folders', id));
        return true;
    } catch (error) {
        console.error("Error deleting folder:", error);
        return false;
    }
};