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

    // NOUVELLE FONCTION : Réorganiser les blocs
    reorderBlocks: (activeId, overId) => set((state) => {
        const activeBlocks = state.blocks.filter(b => b.scenarioId === state.activeScenarioId);
        const oldIndex = activeBlocks.findIndex(b => b.id === activeId);
        const newIndex = activeBlocks.findIndex(b => b.id === overId);

        if (oldIndex === -1 || newIndex === -1) return state;

        // Déplacer l'élément dans la liste du scénario actif
        const reorderedBlocks = [...activeBlocks];
        const [movedBlock] = reorderedBlocks.splice(oldIndex, 1);
        reorderedBlocks.splice(newIndex, 0, movedBlock);

        // Mettre à jour les numéros d'ordre
        const finalActiveBlocks = reorderedBlocks.map((b, i) => ({ ...b, order: i + 1 }));

        // Garder les blocs des autres scénarios intacts
        const otherBlocks = state.blocks.filter(b => b.scenarioId !== state.activeScenarioId);

        return { blocks: [...otherBlocks, ...finalActiveBlocks] };
    }),

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