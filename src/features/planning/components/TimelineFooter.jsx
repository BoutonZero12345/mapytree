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
        <div className="pt-2 border-t mt-auto flex flex-col gap-2 shrink-0 bg-white p-3">
            <button onClick={saveToDb} disabled className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm opacity-55">
                Sauvegarder le projet
            </button>
        </div>
    );

    return (
        <div className="pt-2 border-t mt-auto flex flex-col gap-2 shrink-0 bg-white p-3">
            <div onClick={() => setCollapsed(!collapsed)} className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded-xl cursor-pointer border border-gray-150 shadow-sm">
                {collapsed ? (
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-505">
                        <span className="flex items-center gap-1">⏱️ {formatDur(totalMins)}</span>
                        <span className="flex items-center gap-1">💶 {totalBudget} €</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1 text-xs w-full">
                        <div className="flex justify-between font-medium"><span>Durée :</span><span className="font-extrabold">{formatDur(totalMins)}</span></div>
                        <div className="flex justify-between font-medium"><span>Budget :</span><span className="font-extrabold text-blue-600">{totalBudget} €</span></div>
                    </div>
                )}
                <span className="text-[10px] text-blue-650 font-extrabold">{collapsed ? 'Détails' : 'Réduire'}</span>
            </div>
            <button onClick={saveToDb} disabled={isSaving} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm">
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder le projet'}
            </button>
        </div>
    );
}
