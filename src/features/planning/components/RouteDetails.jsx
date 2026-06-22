import { useState } from 'react';
import { TRANSPORT_MODES } from './ModeButtons';
import RouteSummary from './RouteSummary';
import RouteStepsList from './RouteStepsList';

export default function RouteDetails({ nextBlockMode, travelInfo, isLocked, toggleLock }) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    if (!travelInfo) return null;

    const modeSvg = TRANSPORT_MODES.find(m => m.id === nextBlockMode)?.svg;
    const hasSteps = nextBlockMode === 'TRANSIT' && travelInfo.steps;

    if (!hasSteps) {
        return (
            <div className={`flex items-center justify-between px-3 py-2 rounded-xl border shadow-xs transition-all ${isLocked ? 'bg-blue-50/50 border-blue-200 text-blue-800' : 'bg-white border-gray-200 text-gray-700'}`}>
                <span className="text-[11px] font-extrabold flex items-center gap-1.5 truncate">
                    <span className="text-gray-505 shrink-0">{modeSvg}</span>
                    <span className="truncate">{travelInfo.duration} ({travelInfo.distance})</span>
                </span>
                <button onClick={toggleLock} className={`p-1.5 rounded-lg transition-colors ${isLocked ? 'text-blue-600 hover:bg-blue-100/50' : 'text-gray-400 hover:bg-gray-100'}`} title={isLocked ? "Déverrouiller" : "Verrouiller"}>
                    {isLocked ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>}
                </button>
            </div>
        );
    }

    return (
        <div className="flex gap-2 w-full items-start max-w-full">
            {/* Left side: Route Summary Header (30% width) */}
            <div className={`w-[110px] shrink-0 flex flex-col p-2.5 rounded-xl border shadow-xs transition-all ${isLocked ? 'bg-blue-50/50 border-blue-200 text-blue-800' : 'bg-white border-gray-200 text-gray-700'}`}>
                <div className="flex items-center gap-1.5">
                    <span className="text-gray-505 shrink-0">{modeSvg}</span>
                    <span className="text-[10px] font-black truncate">{travelInfo.duration}</span>
                </div>
                <div className="text-[9px] text-gray-450 font-bold mt-0.5">({travelInfo.distance})</div>
                
                <div className="flex items-center gap-1 mt-1.5 justify-between">
                    <button onClick={toggleLock} className={`p-1 rounded transition-colors ${isLocked ? 'text-blue-600 hover:bg-blue-100/50' : 'text-gray-400 hover:bg-gray-100'}`} title={isLocked ? "Déverrouiller" : "Verrouiller"}>
                        {isLocked ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>}
                    </button>
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded text-gray-400 hover:bg-gray-150 transition-colors" title={isCollapsed ? "Détails" : "Masquer"}>
                        <span className={`text-[10px] font-black inline-block transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}>&gt;</span>
                    </button>
                </div>
            </div>

            {/* Right side: Steps list or summary (70% width) */}
            <div className="flex-1 min-w-0">
                {isCollapsed ? <RouteSummary steps={travelInfo.steps} /> : <RouteStepsList steps={travelInfo.steps} />}
            </div>
        </div>
    );
}
