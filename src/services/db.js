import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const DATE_ID = 'mon-date-unique';

export const saveDatePlan = async (data) => {
    try {
        const dateRef = doc(db, 'dates', DATE_ID);
        await setDoc(dateRef, { ...data, updatedAt: new Date().toISOString() });
        return true;
    } catch (error) {
        return false;
    }
};

export const loadDatePlan = async () => {
    try {
        const dateRef = doc(db, 'dates', DATE_ID);
        const docSnap = await getDoc(dateRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        return null;
    }
};