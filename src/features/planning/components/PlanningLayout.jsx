import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDateStore } from '../store/useDateStore';
import Map from '../../maps/components/Map';
import Timeline from './Timeline';

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
        <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
            {/* Sidebar Gauche */}
            <div className="w-full md:w-[450px] bg-white shadow-xl z-10 flex flex-col">
                <div className="p-4 border-b flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                        title="Retour au tableau de bord"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <h1 className="text-xl font-extrabold text-gray-800 truncate">{currentDateName || 'Chargement...'}</h1>
                </div>
                <div className="flex-1 overflow-hidden p-4">
                    <Timeline />
                </div>
            </div>

            {/* Zone Carte */}
            <div className="flex-1 relative">
                <Map />
            </div>
        </div>
    );
}