import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDateStore } from '../store/useDateStore';
import Timeline from './Timeline';

export default function DesktopSidebar() {
    const navigate = useNavigate();
    const [isDaySelectorOpen, setIsDaySelectorOpen] = useState(false);
    const { currentDateName, currentDateId, isFavorite, togglePlanningFavorite, selectedDays = [], setSelectedDays, startTime, setStartTime, isSchedulePanelOpen, toggleSchedulePanel } = useDateStore();

    return (
        <div className="hidden lg:flex flex-col h-full lg:w-[400px] xl:w-[450px] bg-white shadow-xl z-10 shrink-0 border-r border-gray-200">
            <div className="p-3 border-b flex items-center gap-2 shrink-0 bg-gray-50">
                <button onClick={() => navigate('/')} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-600 shrink-0" title="Retour">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 min-w-0">
                        <h1 className="text-sm font-black text-gray-800 truncate leading-tight">{currentDateName || 'Chargement...'}</h1>
                        {currentDateId && (
                            <button onClick={() => togglePlanningFavorite(currentDateId)} className={`p-0.5 rounded transition-all ${isFavorite ? 'text-yellow-500 scale-105' : 'text-gray-300 hover:text-gray-400'}`} title="Favoris">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                            </button>
                        )}
                    </div>
                    {selectedDays.length > 0 && (
                        <p className="text-[9px] font-extrabold text-blue-600 truncate flex items-center gap-0.5 mt-0.5">
                            {selectedDays.join(', ')}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <div className="relative">
                        <button onClick={() => setIsDaySelectorOpen(!isDaySelectorOpen)} className={`p-1.5 hover:bg-gray-200 rounded-lg border ${selectedDays.length > 0 ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-gray-400 bg-white border-gray-250/60'}`} title="Jours du planning">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        </button>
                        {isDaySelectorOpen && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setIsDaySelectorOpen(false)} />
                                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-250 rounded-2xl shadow-xl p-3 z-40 min-w-[260px]">
                                    <div className="grid grid-cols-2 gap-1">
                                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => {
                                            const isSel = selectedDays.includes(day);
                                            return (
                                                <button key={day} onClick={() => setSelectedDays(isSel ? selectedDays.filter(d => d !== day) : [...selectedDays, day])} className={`px-2 py-1 text-[11px] font-bold rounded-lg border text-left flex items-center justify-between ${isSel ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                                                    <span>{day}</span>
                                                    {isSel && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5"><polyline points="20 6 9 17 4 12" /></svg>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="text-[11px] font-black bg-white border border-gray-250 rounded-lg px-1 py-1 w-[64px]" title="Heure de départ" />
                    <button onClick={toggleSchedulePanel} className={`p-1.5 rounded-lg border ${isSchedulePanelOpen ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-250 text-gray-700'}`} title="Déroulé">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></svg>
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden p-3"><Timeline /></div>
        </div>
    );
}
