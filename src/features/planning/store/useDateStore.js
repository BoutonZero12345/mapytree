import { create } from 'zustand';
import { saveDatePlan, loadDatePlan } from '../../../services/db';

export const useDateStore = create((set, get) => ({
    blocks: [],
    travelInfos: [],
    isSaving: false,
    isLoading: false,

    addBlock: (place) => set((state) => ({
        blocks: [
            ...state.blocks,
            {
                ...place,
                id: crypto.randomUUID(),
                order: state.blocks.length + 1,
                durationMinutes: 60
            }
        ]
    })),

    updateTravelInfos: (infos) => set({ travelInfos: infos }),

    loadFromDb: async () => {
        set({ isLoading: true });
        const blocks = await loadDatePlan();
        set({ blocks, isLoading: false });
    },

    saveToDb: async () => {
        set({ isSaving: true });
        await saveDatePlan(get().blocks);
        set({ isSaving: false });
    }
}));