import { useState } from 'react';
import { useDateStore } from '../store/useDateStore';

export default function TimelineFooter() {
    const blocks = useDateStore(s => s.blocks || []);
    const actId = useDateStore(s => s.activeScenarioId);
    const travelInfos = useDateStore(s => s.travelInfos || []);
    const saveToDb = useDateStore(s => s.saveToDb);
    const isSaving = useDateStore(s => s.isSaving);
    const [collapsed, setCollapsed] = useState(true);

    const activeBlocks = blocks.filter(b => b.scenarioId === actId);
    const totalBudget = activeBlocks.reduce((sum, b) => sum + (Number(b.budget) || 0), 0);

    const parseMins = (txt) => {
        if (!txt) return 0;
        const h = txt.match(/(\d+)\s*(h|heure|hour)/i);
        const m = txt.match(/(\d+)\s*(m|min)/i);
        return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
    };

    const totalMins = activeBlocks.reduce((sum, b, i) => {
        const travel = i < activeBlocks.length - 1 && travelInfos[i] ? parseMins(travelInfos[i].duration) : 0;
        return sum + (Number(b.durationMinutes) || 0) + travel;
    }, 0);

    const formatDur = (mins) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m} min`;
    };

    if (activeBlocks.length === 0) return (
        <div className="pt-2 border-t mt-auto flex items-center gap-2 shrink-0 bg-white p-3">
            <div className="flex items-center justify-between gap-1.5 py-2 px-2.5 bg-gray-50 rounded-xl border border-gray-150 shadow-sm flex-1 max-w-[200px] text-[11px] opacity-55 select-none">
                <div className="flex items-center gap-2 font-bold text-gray-505">
                    <span>⏱️ 0 min</span>
                    <span>💶 0 €</span>
                </div>
                <span className="text-[10px] text-blue-650 font-black">&gt;</span>
            </div>
            <button onClick={saveToDb} disabled className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-xl font-bold text-xs shadow-sm h-[36px] flex items-center justify-center opacity-55">
                Sauvegarder le projet
            </button>
        </div>
    );

    return (
        <div className="pt-2 border-t mt-auto flex flex-col gap-2 shrink-0 bg-white p-3">
            {!collapsed && (
                <div className="flex flex-col gap-1 text-[11px] w-full bg-gray-50 p-2.5 rounded-xl border border-gray-150 shadow-inner mb-1">
                    <div className="flex justify-between font-medium text-gray-600">
                        <span>Durée :</span>
                        <span className="font-extrabold text-gray-800">{formatDur(totalMins)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-gray-600">
                        <span>Budget :</span>
                        <span className="font-extrabold text-blue-600">{totalBudget} €</span>
                    </div>
                </div>
            )}
            <div className="flex items-center gap-2 w-full">
                <div onClick={() => setCollapsed(!collapsed)} className="flex items-center justify-between gap-1 py-2 px-2.5 bg-gray-50 rounded-xl cursor-pointer border border-gray-150 shadow-sm flex-1 max-w-[200px] text-[11px] select-none hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-2 font-bold text-gray-505 truncate">
                        <span className="truncate">⏱️ {formatDur(totalMins)}</span>
                        <span className="truncate">💶 {totalBudget}€</span>
                    </div>
                    <span className={`text-[10px] text-blue-650 font-black shrink-0 transition-transform ${collapsed ? '' : 'rotate-90'}`}>
                        &gt;
                    </span>
                </div>
                <button onClick={saveToDb} disabled={isSaving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-xl font-bold text-xs shadow-sm h-[36px] flex items-center justify-center transition-all">
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder le projet'}
                </button>
            </div>
        </div>
    );
}
