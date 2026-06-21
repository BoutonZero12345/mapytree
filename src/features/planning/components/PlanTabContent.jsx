import { useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDateStore } from '../store/useDateStore';
import SortableBlock from './SortableBlock';

export default function PlanTabContent() {
    const { blocks = [], activeScenarioId, travelInfos = [], reorderBlocks, startTime } = useDateStore();
    const activeBlocks = blocks.filter(b => b.scenarioId === activeScenarioId);

    const parseMins = (txt) => {
        if (!txt) return 0;
        const h = txt.match(/(\d+)\s*(h|heure|hour)/i);
        const m = txt.match(/(\d+)\s*(m|min)/i);
        return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
    };

    const activeBlocksWithTimes = useMemo(() => {
        const [startH, startM] = startTime.split(':').map(Number);
        let currentMinutes = startH * 60 + startM;
        return activeBlocks.map((block, index) => {
            if (block.fixedStartTime) {
                const [fH, fM] = block.fixedStartTime.split(':').map(Number);
                currentMinutes = fH * 60 + fM;
            }
            const timeStr = `${Math.floor(currentMinutes / 60) % 24}:${(currentMinutes % 60).toString().padStart(2, '0')}`;
            currentMinutes += (Number(block.durationMinutes) || 0) + (index < activeBlocks.length - 1 && travelInfos[index] ? parseMins(travelInfos[index].duration) : 0);
            return { ...block, scheduledStartTime: timeStr };
        });
    }, [activeBlocks, travelInfos, startTime]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    if (activeBlocks.length === 0) return (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center space-y-4 p-4">
            <p className="text-base font-semibold">Ce scénario est vide.</p>
            <p className="text-xs text-gray-400">Ajoute des lieux via la carte ou tes favoris en cliquant sur le bouton '+' ou en recherchant.</p>
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-4 no-scrollbar">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={e => e.over && e.active.id !== e.over.id && reorderBlocks(e.active.id, e.over.id)}>
                <SortableContext items={activeBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    {activeBlocksWithTimes.map((block, index) => (
                        <SortableBlock
                            key={block.id}
                            block={block}
                            index={index}
                            travelInfo={travelInfos[index]}
                            scheduledStartTime={block.scheduledStartTime}
                            isLast={index === activeBlocks.length - 1}
                            nextBlockId={activeBlocks[index + 1]?.id}
                            nextBlockMode={activeBlocks[index + 1]?.travelMode || 'DRIVING'}
                            nextBlockRouteIndex={activeBlocks[index + 1]?.selectedRouteIndex || 0}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
}
