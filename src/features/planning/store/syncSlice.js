import { saveDatePlan, loadDatePlan } from '../../../services/db';

export const createSyncSlice = (set, get) => ({
    currentDateId: null,
    currentDateName: '',
    isSaving: false,
    isLoading: false,
    selectedDays: [], // NOUVEAU : Jours de la semaine sélectionnés pour ce planning

    setSelectedDays: (days) => {
        set({ selectedDays: days });
        get().saveToDb(); // Sauvegarde automatique lors du changement
    },

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
                selectedDays: data.selectedDays || [], // Charge depuis la DB
                isFavorite: data.isFavorite || false, // Charge depuis la DB
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
            startTime: state.startTime,
            selectedDays: state.selectedDays, // Enregistre dans la DB
            isFavorite: state.isFavorite || false
        });

        set({ isSaving: false });
    }
});