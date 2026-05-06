import { useEffect, useState } from 'react';
import { useDateStore } from '../store/useDateStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableBlock({ block, index, travelInfo, isLast }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
    const updateBlockDetails = useDateStore((state) => state.updateBlockDetails);
    const deleteBlock = useDateStore((state) => state.deleteBlock);

    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState(block.name);

    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 1, position: 'relative' };

    const handleSaveName = () => {
        updateBlockDetails(block.id, { name: editName });
        setIsEditingName(false);
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div className={`bg-white border ${isDragging ? 'border-blue-500 shadow-xl' : 'border-gray-200'} rounded-xl p-4 shadow-sm flex flex-col gap-2`}>
                {/* En-tête */}
                <div className="flex items-center gap-3">
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 p-1 touch-none">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                    </div>
                    <div className="bg-blue-100 text-blue-600 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">{index + 1}</div>

                    <div className="flex-1 overflow-hidden">
                        {isEditingName ? (
                            <div className="flex items-center gap-2">
                                <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} onBlur={handleSaveName} onKeyDown={(e) => e.key === 'Enter' && handleSaveName()} className="w-full px-2 py-1 text-sm border rounded-md border-blue-500 outline-none" />
                            </div>
                        ) : (
                            <>
                                <h3 className="font-bold text-gray-800 truncate">{block.name}</h3>
                                <p className="text-xs text-gray-500 truncate">{block.address}</p>
                            </>
                        )}
                    </div>

                    {/* Boutons Actions Bloc */}
                    <div className="flex gap-1 shrink-0">
                        <button onClick={() => setIsEditingName(!isEditingName)} className="p-1 text-gray-400 hover:text-blue-600 rounded-md"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                        <button onClick={() => { if (window.confirm("Supprimer ce lieu ?")) deleteBlock(block.id); }} className="p-1 text-gray-400 hover:text-red-600 rounded-md"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                    </div>
                </div>

                {/* Zone de détails (Durée, Budget, Notes) */}
                <div className="pl-[3.5rem] flex flex-col gap-3 mt-2 pr-2">
                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                        <div className="flex items-center gap-2"><span className="text-sm text-gray-600">⏱️</span><input type="number" value={block.durationMinutes || ''} onChange={(e) => updateBlockDetails(block.id, { durationMinutes: Number(e.target.value) })} className="border border-gray-300 rounded-md px-2 py-1 w-16 text-sm" /><span className="text-sm text-gray-600">min</span></div>
                        <div className="flex items-center gap-2"><span className="text-sm text-gray-600">💶</span><input type="number" value={block.budget || ''} onChange={(e) => updateBlockDetails(block.id, { budget: Number(e.target.value) })} placeholder="0" className="border border-gray-300 rounded-md px-2 py-1 w-16 text-sm" /><span className="text-sm text-gray-600">€</span></div>
                    </div>
                    <div className="flex items-start gap-2"><span className="text-sm text-gray-600 mt-1">📝</span><textarea value={block.notes || ''} onChange={(e) => updateBlockDetails(block.id, { notes: e.target.value })} placeholder="Mémos..." className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm resize-none h-14" /></div>
                </div>
            </div>
            {!isLast && travelInfo && <div className="flex items-center gap-2 pl-[4.75rem] py-2 text-sm text-gray-500 font-medium border-l-2 border-dashed border-gray-300 ml-[1.8rem]"><span>🚗 Trajet : {travelInfo.duration} ({travelInfo.distance})</span></div>}
        </div>
    );
}

export default function Timeline() {
    const blocks = useDateStore((state) => state.blocks);
    const scenarios = useDateStore((state) => state.scenarios);
    const activeScenarioId = useDateStore((state) => state.activeScenarioId);
    const setActiveScenario = useDateStore((state) => state.setActiveScenario);
    const addScenario = useDateStore((state) => state.addScenario);
    const updateScenarioName = useDateStore((state) => state.updateScenarioName);
    const deleteScenario = useDateStore((state) => state.deleteScenario);
    const reorderBlocks = useDateStore((state) => state.reorderBlocks);

    const travelInfos = useDateStore((state) => state.travelInfos);
    const saveToDb = useDateStore((state) => state.saveToDb);
    const isSaving = useDateStore((state) => state.isSaving);

    const [newScenarioName, setNewScenarioName] = useState('');
    const [isAddingScenario, setIsAddingScenario] = useState(false);

    // États pour modifier le nom du Plan actif
    const [editingScenarioId, setEditingScenarioId] = useState(null);
    const [editScenarioName, setEditScenarioName] = useState('');

    const activeBlocks = blocks.filter(b => b.scenarioId === activeScenarioId);
    const totalBudget = activeBlocks.reduce((sum, block) => sum + (Number(block.budget) || 0), 0);

    const handleAddScenario = (e) => {
        e.preventDefault();
        if (newScenarioName.trim()) { addScenario(newScenarioName.trim()); setNewScenarioName(''); setIsAddingScenario(false); }
    };

    const handleSaveScenarioName = (id) => {
        if (editScenarioName.trim()) updateScenarioName(id, editScenarioName.trim());
        setEditingScenarioId(null);
    };

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    const handleDragEnd = (event) => { const { active, over } = event; if (over && active.id !== over.id) reorderBlocks(active.id, over.id); };

    return (
        <div className="flex flex-col h-full">
            {/* --- ONGLETS DES PLANS --- */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b mb-4 no-scrollbar">
                {scenarios.map((scenario) => {
                    const isActive = activeScenarioId === scenario.id;
                    return (
                        <div key={scenario.id} className={`flex items-center rounded-full transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>

                            {editingScenarioId === scenario.id ? (
                                <input autoFocus value={editScenarioName} onChange={(e) => setEditScenarioName(e.target.value)} onBlur={() => handleSaveScenarioName(scenario.id)} onKeyDown={(e) => e.key === 'Enter' && handleSaveScenarioName(scenario.id)} className="px-4 py-2 text-sm font-bold bg-transparent border-b-2 border-white outline-none w-28 text-white" />
                            ) : (
                                <button onClick={() => setActiveScenario(scenario.id)} className="px-4 py-2 text-sm font-bold whitespace-nowrap hover:opacity-80">
                                    {scenario.name}
                                </button>
                            )}

                            {/* Icônes Stylo/Poubelle pour le plan actif */}
                            {isActive && editingScenarioId !== scenario.id && (
                                <div className="flex pr-2 gap-1 items-center">
                                    <button onClick={() => { setEditingScenarioId(scenario.id); setEditScenarioName(scenario.name); }} className="p-1 hover:bg-blue-700 rounded-full" title="Modifier le plan"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                                    {scenarios.length > 1 && (
                                        <button onClick={() => { if (window.confirm("Supprimer ce plan et tous ses lieux ?")) deleteScenario(scenario.id); }} className="p-1 hover:bg-red-500 rounded-full" title="Supprimer le plan"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {isAddingScenario ? (
                    <form onSubmit={handleAddScenario} className="flex gap-2">
                        <input type="text" autoFocus value={newScenarioName} onChange={(e) => setNewScenarioName(e.target.value)} placeholder="Nouveau plan" className="px-3 py-1 text-sm border rounded-full outline-none focus:border-blue-500 w-28" />
                        <button type="submit" className="text-blue-600 font-bold px-2">✓</button>
                        <button type="button" onClick={() => setIsAddingScenario(false)} className="text-gray-400 font-bold px-2">✕</button>
                    </form>
                ) : (
                    <button onClick={() => setIsAddingScenario(true)} className="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap bg-blue-50 text-blue-600 hover:bg-blue-100">+ Variante</button>
                )}
            </div>

            {/* --- LISTE DES DESTINATIONS --- */}
            {activeBlocks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center space-y-4">
                    <p className="text-lg">Ce scénario est vide.</p><p className="text-sm">Ajoute des lieux via la carte.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={activeBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                            {activeBlocks.map((block, index) => (
                                <SortableBlock key={block.id} block={block} index={index} travelInfo={travelInfos[index]} isLast={index === activeBlocks.length - 1} />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            {/* --- PIED DE PAGE --- */}
            <div className="pt-4 border-t mt-auto flex flex-col gap-3">
                {activeBlocks.length > 0 && (
                    <div className="flex justify-between items-center px-2"><span className="font-bold text-gray-600">Budget total estimé :</span><span className="font-extrabold text-lg text-blue-600">{totalBudget} €</span></div>
                )}
                <button onClick={saveToDb} disabled={isSaving || blocks.length === 0} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder le projet'}
                </button>
            </div>
        </div>
    );
}