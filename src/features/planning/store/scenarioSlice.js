export const createScenarioSlice = (set, get) => ({
    scenarios: [{ id: 'plan_a', name: 'Plan A' }],
    activeScenarioId: 'plan_a',

    setActiveScenario: (id) => set({ activeScenarioId: id }),

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
            // On supprime aussi les lieux de ce plan (Zustand permet de lire state.blocks même si c'est dans une autre tranche)
            blocks: state.blocks.filter(b => b.scenarioId !== id)
        };
    }),
});