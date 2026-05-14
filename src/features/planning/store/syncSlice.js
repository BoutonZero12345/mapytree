import { saveDatePlan, loadDatePlan } from '../../../services/db';

export const createSyncSlice = (set, get) => ({
    currentDateId: null,
    currentDateName: '',
    isSaving: false,
    isLoading: false,

    loadFromDb: async (id) => {
        if (!id) return;
        set({ isLoading: true, currentDateId: id });
        const data = await loadDatePlan(id);
        if (data) {
            set({
                currentDateName: data.name || 'Mon Date',
                blocks: data.blocks || [],
                scenarios: data.scenarios || [{ id: 'plan_a', name: 'Plan A' }],
                activeScenarioId: data.scenarios ? data.scenarios[0].id : 'plan_a',
                startTime: data.startTime || '09:00',
                isLoading: false
            });
        } else {
            set({ isLoading: false });
        }
    },

    saveToDb: async () => {
        const state = get();
        if (!state.currentDateId) return;
        set({ isSaving: true });

        await saveDatePlan(state.currentDateId, {
            blocks: state.blocks,
            scenarios: state.scenarios,
            startTime: state.startTime
        });

        set({ isSaving: false });
    }
});