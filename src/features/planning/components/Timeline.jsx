import { useDateStore } from '../store/useDateStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ScenarioTabs from './ScenarioTabs';
import SortableBlock from './SortableBlock';

export default function Timeline() {
    const blocks = useDateStore((state) => state.blocks);
    const activeScenarioId = useDateStore((state) => state.activeScenarioId);
    const reorderBlocks = useDateStore((state) => state.reorderBlocks);
    const travelInfos = useDateStore((state) => state.travelInfos);
    const saveToDb = useDateStore((state) => state.saveToDb);
    const isSaving = useDateStore((state) => state.isSaving);

    const activeBlocks = blocks.filter(b => b.scenarioId === activeScenarioId);
    const totalBudget = activeBlocks.reduce((sum, block) => sum + (Number(block.budget) || 0), 0);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            reorderBlocks(active.id, over.id);
        }
    };

    return (
        <div className="flex flex-col h-full">

            {/* 1. Les onglets des variantes */}
            <ScenarioTabs />

            {/* 2. La liste des lieux (Drag & Drop) */}
            {activeBlocks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center space-y-4">
                    <p className="text-lg">Ce scénario est vide.</p>
                    <p className="text-sm">Ajoute des lieux via la carte.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={activeBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                            {activeBlocks.map((block, index) => (
                                <SortableBlock
                                    key={block.id}
                                    block={block}
                                    index={index}
                                    travelInfo={travelInfos[index]}
                                    isLast={index === activeBlocks.length - 1}
                                    nextBlockId={activeBlocks[index + 1]?.id}
                                    nextBlockMode={activeBlocks[index + 1]?.travelMode || 'DRIVING'}
                                    nextBlockRouteIndex={activeBlocks[index + 1]?.selectedRouteIndex || 0}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            {/* 3. Le Footer (Budget et Sauvegarde) */}
            <div className="pt-4 border-t mt-auto flex flex-col gap-3 shrink-0 bg-white">
                {activeBlocks.length > 0 && (
                    <div className="flex justify-between items-center px-2">
                        <span className="font-bold text-gray-600">Budget total estimé :</span>
                        <span className="font-extrabold text-lg text-blue-600">{totalBudget} €</span>
                    </div>
                )}
                <button
                    onClick={saveToDb}
                    disabled={isSaving || activeBlocks.length === 0}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {isSaving ? 'Sauvegarde en cours...' : 'Sauvegarder le projet'}
                </button>
            </div>

        </div>
    );
}