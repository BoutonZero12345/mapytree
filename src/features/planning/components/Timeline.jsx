import { useEffect, useState } from 'react';
import { useDateStore } from '../store/useDateStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableBlock({ block, index, travelInfo, isLast }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
    const updateBlockDetails = useDateStore((state) => state.updateBlockDetails); // On récupère la nouvelle fonction

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
        position: 'relative',
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div className={`bg-white border ${isDragging ? 'border-blue-500 shadow-xl' : 'border-gray-200'} rounded-xl p-4 shadow-sm flex flex-col gap-2`}>
                {/* En-tête du bloc (Titre et Adresse) */}
                <div className="flex items-center gap-3">
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 p-1 touch-none">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle>
                            <circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle>
                        </svg>
                    </div>

                    <div className="bg-blue-100 text-blue-600 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                        {index + 1}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="font-bold text-gray-800 truncate">{block.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{block.address}</p>
                    </div>
                </div>

                {/* NOUVEAU : Zone de détails (Durée, Budget, Notes) */}
                <div className="pl-[3.5rem] flex flex-col gap-3 mt-2 pr-2">

                    <div className="flex items-center gap-4">
                        {/* Durée */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600" title="Durée">⏱️</span>
                            <input
                                type="number"
                                value={block.durationMinutes || ''}
                                onChange={(e) => updateBlockDetails(block.id, { durationMinutes: Number(e.target.value) })}
                                className="border border-gray-300 rounded-md px-2 py-1 w-16 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                            />
                            <span className="text-sm text-gray-600">min</span>
                        </div>

                        {/* Budget */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600" title="Budget">💶</span>
                            <input
                                type="number"
                                value={block.budget || ''}
                                onChange={(e) => updateBlockDetails(block.id, { budget: Number(e.target.value) })}
                                placeholder="0"
                                className="border border-gray-300 rounded-md px-2 py-1 w-16 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                            />
                            <span className="text-sm text-gray-600">€</span>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="flex items-start gap-2">
                        <span className="text-sm text-gray-600 mt-1" title="Notes et Mémos">📝</span>
                        <textarea
                            value={block.notes || ''}
                            onChange={(e) => updateBlockDetails(block.id, { notes: e.target.value })}
                            placeholder="Mémos (réservation au nom de..., code porte 1234...)"
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-14 text-gray-800"
                        />
                    </div>

                </div>
            </div>

            {!isLast && travelInfo && (
                <div className="flex items-center gap-2 pl-[4.75rem] py-2 text-sm text-gray-500 font-medium border-l-2 border-dashed border-gray-300 ml-[1.8rem]">
                    <span>🚗 Trajet : {travelInfo.duration} ({travelInfo.distance})</span>
                </div>
            )}
        </div>
    );
}

export default function Timeline() {
    const blocks = useDateStore((state) => state.blocks);
    const scenarios = useDateStore((state) => state.scenarios);
    const activeScenarioId = useDateStore((state) => state.activeScenarioId);
    const setActiveScenario = useDateStore((state) => state.setActiveScenario);
    const addScenario = useDateStore((state) => state.addScenario);
    const reorderBlocks = useDateStore((state) => state.reorderBlocks);

    const travelInfos = useDateStore((state) => state.travelInfos);
    const saveToDb = useDateStore((state) => state.saveToDb);
    const isSaving = useDateStore((state) => state.isSaving);

    const [newScenarioName, setNewScenarioName] = useState('');
    const [isAddingScenario, setIsAddingScenario] = useState(false);

    const activeBlocks = blocks.filter(b => b.scenarioId === activeScenarioId);

    // NOUVEAU : Calcul du budget total du scénario en cours
    const totalBudget = activeBlocks.reduce((sum, block) => sum + (Number(block.budget) || 0), 0);

    const handleAddScenario = (e) => {
        e.preventDefault();
        if (newScenarioName.trim()) {
            addScenario(newScenarioName.trim());
            setNewScenarioName('');
            setIsAddingScenario(false);
        }
    };

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
            <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b mb-4 no-scrollbar">
                {scenarios.map((scenario) => (
                    <button
                        key={scenario.id}
                        onClick={() => setActiveScenario(scenario.id)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeScenarioId === scenario.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                    >
                        {scenario.name}
                    </button>
                ))}

                {isAddingScenario ? (
                    <form onSubmit={handleAddScenario} className="flex gap-2">
                        <input
                            type="text"
                            autoFocus
                            value={newScenarioName}
                            onChange={(e) => setNewScenarioName(e.target.value)}
                            placeholder="Ex: Plan Pluie"
                            className="px-3 py-1 text-sm border rounded-full outline-none focus:border-blue-500"
                        />
                        <button type="submit" className="text-blue-600 font-bold px-2">✓</button>
                        <button type="button" onClick={() => setIsAddingScenario(false)} className="text-gray-400 font-bold px-2">✕</button>
                    </form>
                ) : (
                    <button onClick={() => setIsAddingScenario(true)} className="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap bg-blue-50 text-blue-600 hover:bg-blue-100">
                        + Variante
                    </button>
                )}
            </div>

            {activeBlocks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center space-y-4">
                    <p className="text-lg">Ce scénario est vide.</p>
                    <p className="text-sm">Ajoute des lieux pour construire cette alternative.</p>
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
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            <div className="pt-4 border-t mt-auto flex flex-col gap-3">
                {/* NOUVEAU : Affichage du budget total */}
                {activeBlocks.length > 0 && (
                    <div className="flex justify-between items-center px-2">
                        <span className="font-bold text-gray-600">Budget total estimé :</span>
                        <span className="font-extrabold text-lg text-blue-600">{totalBudget} €</span>
                    </div>
                )}

                <button
                    onClick={saveToDb}
                    disabled={isSaving || blocks.length === 0}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder le projet'}
                </button>
            </div>
        </div>
    );
}