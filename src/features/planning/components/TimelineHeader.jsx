import { useDateStore } from '../store/useDateStore';

export default function TimelineHeader() {
    const startTime = useDateStore((state) => state.startTime);
    const setStartTime = useDateStore((state) => state.setStartTime);

    return (
        <div className="flex items-center gap-2 mb-3 bg-slate-50 border border-gray-150/70 p-2.5 rounded-xl shrink-0 lg:hidden">
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
    );
}
