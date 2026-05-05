import { collection, doc, setDoc, getDoc, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// 1. Créer un nouveau planning
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

// 2. Récupérer la liste de tous les plannings
export const getAllDates = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'dates'));
        const dates = [];
        querySnapshot.forEach((doc) => {
            dates.push({ id: doc.id, ...doc.data() });
        });
        // On trie pour avoir le plus récent en haut de la liste
        return dates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error("Erreur de récupération :", error);
        return [];
    }
};

// 3. Sauvegarder un planning spécifique
export const saveDatePlan = async (id, data) => {
    try {
        const dateRef = doc(db, 'dates', id);
        // 'merge: true' permet de mettre à jour les blocs sans écraser le nom du planning
        await setDoc(dateRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
        return true;
    } catch (error) {
        return false;
    }
};

// 4. Charger un planning spécifique
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