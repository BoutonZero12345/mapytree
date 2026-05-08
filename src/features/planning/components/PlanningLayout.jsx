import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDateStore } from '../store/useDateStore';
import Map from '../../maps/components/Map';
import Timeline from './Timeline';
import DailySchedule from './DailySchedule';

export default function PlanningLayout() {
    const { id } = useParams();
    const navigate = useNavigate();
    const loadFromDb = useDateStore((state) => state.loadFromDb);
    const currentDateName = useDateStore((state) => state.currentDateName);

    useEffect(() => {
        if (id) {
            loadFromDb(id);
        }
    }, [id, loadFromDb]);

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-gray-50 overflow-hidden">

            {/* 1. Sidebar Gauche (Édition du Planning) */}
            <div className="w-full h-[55%] md:h-full md:w-[400px] xl:w-[450px] bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-xl z-10 flex flex-col order-2 md:order-1 shrink-0">
                <div className="p-3 md:p-4 border-b flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                        title="Retour"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <h1 className="text-lg md:text-xl font-extrabold text-gray-800 truncate">{currentDateName || 'Chargement...'}</h1>
                </div>
                <div className="flex-1 overflow-hidden p-3 md:p-4">
                    <Timeline />
                </div>
            </div>

            {/* 2. Zone Carte (Centre) */}
            <div className="w-full h-[45%] md:h-full md:flex-1 relative order-1 md:order-2 z-0">
                <Map />
            </div>

            {/* 3. Calendrier (Toujours à droite, s'agrandit ou se réduit) */}
            <div className="hidden lg:flex h-full md:order-3 z-10">
                <DailySchedule />
            </div>

        </div>
    );
}