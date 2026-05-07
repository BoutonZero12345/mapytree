export const createBlockSlice = (set, get) => ({
    blocks: [],
    travelInfos: [],

    addBlock: (place) => {
        const state = get();
        set({
            blocks: [
                ...state.blocks,
                {
                    ...place,
                    id: crypto.randomUUID(),
                    order: state.blocks.filter(b => b.scenarioId === state.activeScenarioId).length + 1,
                    durationMinutes: 60,
                    budget: 0,
                    notes: '',
                    travelMode: 'DRIVING',
                    selectedRouteIndex: 0,
                    scenarioId: state.activeScenarioId
                }
            ]
        });
    },

    updateBlockTravelMode: (id, mode) => set((state) => ({
        blocks: state.blocks.map(block =>
            block.id === id ? { ...block, travelMode: mode, selectedRouteIndex: 0 } : block
        )
    })),

    updateBlockRouteIndex: (id, index) => set((state) => ({
        blocks: state.blocks.map(block =>
            block.id === id ? { ...block, selectedRouteIndex: index } : block
        )
    })),

    updateBlockDetails: (id, updates) => set((state) => ({
        blocks: state.blocks.map(block =>
            block.id === id ? { ...block, ...updates } : block
        )
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
});