import { useEffect, useState } from 'react';
import { useDateStore } from '../store/useDateStore';

export default function Timeline() {
    const blocks = useDateStore((state) => state.blocks);
    const scenarios = useDateStore((state) => state.scenarios);
    const activeScenarioId = useDateStore((state) => state.activeScenarioId);
    const setActiveScenario = useDateStore((state) => state.setActiveScenario);
    const addScenario = useDateStore((state) => state.addScenario);

    const travelInfos = useDateStore((state) => state.travelInfos);
    const loadFromDb = useDateStore((state) => state.loadFromDb);
    const saveToDb = useDateStore((state) => state.saveToDb);
    const isSaving = useDateStore((state) => state.isSaving);
    const isLoading = useDateStore((state) => state.isLoading);

    const [newScenarioName, setNewScenarioName] = useState('');
    const [isAddingScenario, setIsAddingScenario] = useState(false);

    useEffect(() => {
        loadFromDb();
    }, [loadFromDb]);

    const activeBlocks = blocks.filter(b => b.scenarioId === activeScenarioId);

    const handleAddScenario = (e) => {
        e.preventDefault();
        if (newScenarioName.trim()) {
            addScenario(newScenarioName.trim());
            setNewScenarioName('');
            setIsAddingScenario(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Chargement du planning...</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b mb-4 no-scrollbar">
                {scenarios.map((scenario) => (
                    <button
                        key={scenario.id}
                        onClick={() => setActiveScenario(scenario.id)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeScenarioId === scenario.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
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
                    <button
                        onClick={() => setIsAddingScenario(true)}
                        className="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
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
                    {activeBlocks.map((block, index) => (
                        <div key={block.id}>
                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 text-blue-600 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                                        {index + 1}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-gray-800 truncate">{block.name}</h3>
                                        <p className="text-xs text-gray-500 truncate">{block.address}</p>
                                    </div>
                                </div>
                                <div className="pl-11 flex items-center gap-2 mt-1">
                                    <span className="text-sm text-gray-600">Durée :</span>
                                    <input
                                        type="number"
                                        defaultValue={block.durationMinutes}
                                        className="border border-gray-300 rounded-md px-2 py-1 w-20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                                    />
                                    <span className="text-sm text-gray-600">min</span>
                                </div>
                            </div>

                            {index < activeBlocks.length - 1 && travelInfos[index] && (
                                <div className="flex items-center gap-2 pl-7 py-2 text-sm text-gray-500 font-medium border-l-2 border-dashed border-gray-300 ml-4">
                                    <span>🚗 Trajet : {travelInfos[index].duration} ({travelInfos[index].distance})</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="pt-4 border-t mt-auto">
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