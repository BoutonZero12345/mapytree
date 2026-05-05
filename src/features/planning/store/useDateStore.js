import { create } from 'zustand';
import { saveDatePlan, loadDatePlan } from '../../../services/db';

export const useDateStore = create((set, get) => ({
    blocks: [],
    scenarios: [{ id: 'plan_a', name: 'Plan A' }],
    activeScenarioId: 'plan_a',
    travelInfos: [],
    isSaving: false,
    isLoading: false,

    setActiveScenario: (id) => set({ activeScenarioId: id }),

    addScenario: (name) => {
        const newId = crypto.randomUUID();
        set((state) => ({
            scenarios: [...state.scenarios, { id: newId, name }],
            activeScenarioId: newId
        }));
    },

    addBlock: (place) => set((state) => ({
        blocks: [
            ...state.blocks,
            {
                ...place,
                id: crypto.randomUUID(),
                order: state.blocks.filter(b => b.scenarioId === state.activeScenarioId).length + 1,
                durationMinutes: 60,
                scenarioId: state.activeScenarioId
            }
        ]
    })),

    updateTravelInfos: (infos) => set({ travelInfos: infos }),

    loadFromDb: async () => {
        set({ isLoading: true });
        const data = await loadDatePlan();
        if (data) {
            set({
                blocks: data.blocks || [],
                scenarios: data.scenarios || [{ id: 'plan_a', name: 'Plan A' }],
                activeScenarioId: data.scenarios ? data.scenarios[0].id : 'plan_a',
                isLoading: false
            });
        } else {
            set({ isLoading: false });
        }
    },

    saveToDb: async () => {
        set({ isSaving: true });
        await saveDatePlan({
            blocks: get().blocks,
            scenarios: get().scenarios
        });
        set({ isSaving: false });
    }
}));