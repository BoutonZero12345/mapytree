import { useDateStore } from '../store/useDateStore';

export default function TimelineHeader() {
    const startTime = useDateStore((state) => state.startTime);
    const setStartTime = useDateStore((state) => state.setStartTime);
    const isSchedulePanelOpen = useDateStore((state) => state.isSchedulePanelOpen);
    const toggleSchedulePanel = useDateStore((state) => state.toggleSchedulePanel);

    return (
        <div className="flex items-center justify-between gap-3 mb-4 bg-slate-50 border border-gray-150/70 p-3 rounded-2xl shrink-0">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-505 uppercase tracking-widest whitespace-nowrap flex items-center gap-1">
                    <svg className="text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    À partir de :
                </span>
                <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="text-xs font-bold bg-white border border-gray-300 rounded-xl px-2 py-1 outline-none focus:border-blue-500 shadow-sm"
                />
            </div>
            <button
                onClick={toggleSchedulePanel}
                className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm ${
                    isSchedulePanelOpen 
                        ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-white border-gray-250 text-gray-700 hover:bg-gray-50'
                }`}
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                {isSchedulePanelOpen ? 'Masquer Déroulé' : 'Afficher Déroulé'}
            </button>
        </div>
    );
}
