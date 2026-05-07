import { useState } from 'react';
import { useDateStore } from '../store/useDateStore';

export default function ScenarioTabs() {
    const scenarios = useDateStore((state) => state.scenarios);
    const activeScenarioId = useDateStore((state) => state.activeScenarioId);
    const setActiveScenario = useDateStore((state) => state.setActiveScenario);
    const addScenario = useDateStore((state) => state.addScenario);
    const updateScenarioName = useDateStore((state) => state.updateScenarioName);
    const deleteScenario = useDateStore((state) => state.deleteScenario);

    const [newScenarioName, setNewScenarioName] = useState('');
    const [isAddingScenario, setIsAddingScenario] = useState(false);
    const [editingScenarioId, setEditingScenarioId] = useState(null);
    const [editScenarioName, setEditScenarioName] = useState('');

    const handleAddScenario = (e) => {
        e.preventDefault();
        if (newScenarioName.trim()) {
            addScenario(newScenarioName.trim());
            setNewScenarioName('');
            setIsAddingScenario(false);
        }
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
                    <div key={scenario.id} className={`flex items-center rounded-full transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {editingScenarioId === scenario.id ? (
                            <input
                                autoFocus
                                value={editScenarioName}
                                onChange={(e) => setEditScenarioName(e.target.value)}
                                onBlur={() => handleSaveScenarioName(scenario.id)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveScenarioName(scenario.id)}
                                className="px-4 py-2 text-sm font-bold bg-transparent outline-none w-28 text-white border-b-2 border-white/50"
                            />
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
                        className="px-3 py-1 text-sm border rounded-full outline-none focus:border-blue-500 w-28"
                    />
                    <button type="submit" className="text-blue-600 font-bold px-2 hover:text-blue-800">✓</button>
                    <button type="button" onClick={() => setIsAddingScenario(false)} className="text-gray-400 font-bold px-2 hover:text-gray-600">✕</button>
                </form>
            ) : (
                <button onClick={() => setIsAddingScenario(true)} className="px-4 py-2 rounded-full text-sm font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                    + Variante
                </button>
            )}
        </div>
    );
}