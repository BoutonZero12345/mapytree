export const createScenarioSlice = (set, get) => ({
    scenarios: [{ id: 'plan_a', name: 'Plan A' }],
    activeScenarioId: 'plan_a',
    startTime: '09:00',
    isScheduleExpanded: true, // NOUVEAU : Gère l'ouverture du tiroir

    setActiveScenario: (id) => set({ activeScenarioId: id }),
    setStartTime: (time) => set({ startTime: time }),

    // NOUVEAU : Fonction pour ouvrir/fermer le tiroir
    toggleScheduleExpanded: () => set((state) => ({ isScheduleExpanded: !state.isScheduleExpanded })),

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
        if (state.scenarios.length <= 1) return state;
        const newScenarios = state.scenarios.filter(s => s.id !== id);
        return {
            scenarios: newScenarios,
            activeScenarioId: state.activeScenarioId === id ? newScenarios[0].id : state.activeScenarioId,
            blocks: state.blocks.filter(b => b.scenarioId !== id)
        };
    }),
});