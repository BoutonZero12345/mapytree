import { create } from 'zustand';
import { saveDatePlan, loadDatePlan } from '../../../services/db';

export const useDateStore = create((set, get) => ({
    currentDateId: null,
    currentDateName: '',
    blocks: [],
    scenarios: [{ id: 'plan_a', name: 'Plan A' }],
    activeScenarioId: 'plan_a',
    travelInfos: [],
    isSaving: false,
    isLoading: false,

    setActiveScenario: (id) => set({ activeScenarioId: id }),

    // --- GESTION DES PLANS (SCÉNARIOS) ---
    addScenario: (name) => {
        const newId = crypto.randomUUID();
        set((state) => ({
            scenarios: [...state.scenarios, { id: newId, name }],
            activeScenarioId: newId
        }));
    },
    updateScenarioName: (id, newName) => set((state) => ({
        scenarios: state.scenarios.map(s => s.id === id ? { ...s, name: newName } : s)
    })),
    deleteScenario: (id) => set((state) => {
        if (state.scenarios.length <= 1) return state; // Empêche de supprimer le dernier plan
        const newScenarios = state.scenarios.filter(s => s.id !== id);
        return {
            scenarios: newScenarios,
            activeScenarioId: state.activeScenarioId === id ? newScenarios[0].id : state.activeScenarioId,
            blocks: state.blocks.filter(b => b.scenarioId !== id) // Supprime aussi les lieux de ce plan
        };
    }),

    // --- GESTION DES DESTINATIONS (BLOCS) ---
    addBlock: (place) => set((state) => ({
        blocks: [
            ...state.blocks,
            {
                ...place,
                id: crypto.randomUUID(),
                order: state.blocks.filter(b => b.scenarioId === state.activeScenarioId).length + 1,
                durationMinutes: 60,
                budget: 0,
                notes: '',
                scenarioId: state.activeScenarioId
            }
        ]
    })),
    updateBlockDetails: (id, updates) => set((state) => ({
        blocks: state.blocks.map(block => block.id === id ? { ...block, ...updates } : block)
    })),
    deleteBlock: (id) => set((state) => ({
        blocks: state.blocks.filter(b => b.id !== id)
    })),

    reorderBlocks: (activeId, overId) => set((state) => {
        const activeBlocks = state.blocks.filter(b => b.scenarioId === state.activeScenarioId);
        const oldIndex = activeBlocks.findIndex(b => b.id === activeId);
        const newIndex = activeBlocks.findIndex(b => b.id === overId);
        if (oldIndex === -1 || newIndex === -1) return state;

        const reorderedBlocks = [...activeBlocks];
        const [movedBlock] = reorderedBlocks.splice(oldIndex, 1);
        reorderedBlocks.splice(newIndex, 0, movedBlock);

        const finalActiveBlocks = reorderedBlocks.map((b, i) => ({ ...b, order: i + 1 }));
        const otherBlocks = state.blocks.filter(b => b.scenarioId !== state.activeScenarioId);
        return { blocks: [...otherBlocks, ...finalActiveBlocks] };
    }),

    updateTravelInfos: (infos) => set({ travelInfos: infos }),

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
        await saveDatePlan(state.currentDateId, { blocks: state.blocks, scenarios: state.scenarios });
        set({ isSaving: false });
    }
}));