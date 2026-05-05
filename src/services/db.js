import { collection, doc, setDoc, getDoc, getDocs, addDoc } from 'firebase/firestore';
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
    } catch (error) {
        console.error("Erreur de création :", error);
        return null;
    }
};

export const getAllDates = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'dates'));
        const dates = [];
        querySnapshot.forEach((doc) => {
            dates.push({ id: doc.id, ...doc.data() });
        });
        return dates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        return [];
    }
};

export const saveDatePlan = async (id, data) => {
    try {
        const dateRef = doc(db, 'dates', id);
        await setDoc(dateRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
        return true;
    } catch (error) {
        return false;
    }
};

export const loadDatePlan = async (id) => {
    try {
        const dateRef = doc(db, 'dates', id);
        const docSnap = await getDoc(dateRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        return null;
    }
};

// ==========================================
// NOUVEAU : SYSTÈME DE CACHE POUR LES ROUTES
// ==========================================

export const getCachedRoute = async (routeKey) => {
    try {
        const docRef = doc(db, 'routes_cache', routeKey);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        return null;
    }
};

export const saveCachedRoute = async (routeKey, routeData) => {
    try {
        const docRef = doc(db, 'routes_cache', routeKey);
        await setDoc(docRef, routeData);
    } catch (error) {
        console.error("Erreur de cache :", error);
    }
};