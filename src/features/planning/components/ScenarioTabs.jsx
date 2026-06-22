import { useState } from 'react';
import { useDateStore } from '../store/useDateStore';

export default function ScenarioTabs() {
    const scenarios = useDateStore((state) => state.scenarios);
    const activeScenarioId = useDateStore((state) => state.activeScenarioId);
    const setActiveScenario = useDateStore((state) => state.setActiveScenario);
    const addScenario = useDateStore((state) => state.addScenario);
    const updateScenarioName = useDateStore((state) => state.updateScenarioName);
    const deleteScenario = useDateStore((state) => state.deleteScenario);
    const reorderScenarios = useDateStore((state) => state.reorderScenarios);

    const [newScenarioName, setNewScenarioName] = useState('');
    const [isAddingScenario, setIsAddingScenario] = useState(false);
    const [editingScenarioId, setEditingScenarioId] = useState(null);
    const [editScenarioName, setEditScenarioName] = useState('');

    const handleAddScenario = (e) => {
        e.preventDefault();
        let name = newScenarioName.trim();
        if (!name) {
            const nextLetter = String.fromCharCode(65 + scenarios.length);
            name = `Plan ${nextLetter}`;
        }
        addScenario(name);
        setNewScenarioName('');
        setIsAddingScenario(false);
    };

    const handleSaveScenarioName = (id) => {
        if (editScenarioName.trim()) {
            updateScenarioName(id, editScenarioName.trim());
        }
        setEditingScenarioId(null);
    };

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b mb-4 no-scrollbar shrink-0">
            {scenarios.map((scenario) => {
                const isActive = activeScenarioId === scenario.id;
                return (
                    <div 
                        key={scenario.id} 
                        draggable={editingScenarioId !== scenario.id}
                        onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', scenario.id);
                            e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            const draggedId = e.dataTransfer.getData('text/plain');
                            if (draggedId && draggedId !== scenario.id) {
                                reorderScenarios(draggedId, scenario.id);
                            }
                        }}
                        className={`flex items-center rounded-full transition-colors cursor-grab active:cursor-grabbing ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    >
                        {editingScenarioId === scenario.id ? (
                            <div className="flex items-center gap-1.5 px-3.5 py-1.5">
                                <input
                                    autoFocus
                                    value={editScenarioName}
                                    onChange={(e) => setEditScenarioName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveScenarioName(scenario.id)}
                                    className="text-sm font-bold bg-transparent outline-none w-24 text-white border-b border-white/50"
                                />
                                <button
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSaveScenarioName(scenario.id);
                                    }}
                                    className="p-1 bg-white text-blue-650 hover:bg-blue-50 text-blue-600 rounded-full transition-colors shrink-0 flex items-center justify-center shadow-xs"
                                    title="Valider le nom"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setActiveScenario(scenario.id)} className="px-4 py-2 text-sm font-bold whitespace-nowrap hover:opacity-80">
                                {scenario.name}
                            </button>
                        )}

                        {isActive && editingScenarioId !== scenario.id && (
                            <div className="flex pr-2 gap-1 items-center">
                                <button
                                    onClick={() => { setEditingScenarioId(scenario.id); setEditScenarioName(scenario.name); }}
                                    className="p-1 hover:bg-blue-700 rounded-full transition-colors"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                </button>
                                {scenarios.length > 1 && (
                                    <button
                                        onClick={() => { if (window.confirm("Supprimer ce plan ?")) deleteScenario(scenario.id); }}
                                        className="p-1 hover:bg-red-500 rounded-full transition-colors"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {isAddingScenario ? (
                <form onSubmit={handleAddScenario} className="flex gap-2">
                    <input
                        type="text"
                        autoFocus
                        value={newScenarioName}
                        onChange={(e) => setNewScenarioName(e.target.value)}
                        placeholder="Nouveau plan"
                        className="px-3 py-1.5 text-sm border rounded-full outline-none focus:border-blue-500 w-28"
                    />
                    <button type="submit" className="text-blue-600 font-bold px-2 hover:text-blue-800">✓</button>
                    <button type="button" onClick={() => setIsAddingScenario(false)} className="text-gray-400 font-bold px-2 hover:text-gray-600">✕</button>
                </form>
            ) : (
                <button onClick={() => setIsAddingScenario(true)} className="w-8 h-8 shrink-0 rounded-full text-base font-black bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors shadow-sm" title="Nouveau plan">
                    +
                </button>
            )}
        </div>
    );
}