import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDateStore } from '../store/useDateStore';
import Map from '../../maps/components/Map';
import PlaceDetailsPanel from './PlaceDetailsPanel';
import DailySchedule from './DailySchedule';
import DesktopSidebar from './DesktopSidebar';
import MobileDrawer from './MobileDrawer';

export default function PlanningLayout() {
    const { id } = useParams();
    const loadFromDb = useDateStore((state) => state.loadFromDb);
    const loadFavorites = useDateStore((state) => state.loadFavorites);
    const isSchedulePanelOpen = useDateStore((state) => state.isSchedulePanelOpen);

    useEffect(() => {
        if (id) {
            loadFromDb(id);
        }
        if (loadFavorites) {
            loadFavorites();
        }
    }, [id, loadFromDb, loadFavorites]);

    return (
        <div className="flex flex-col lg:flex-row h-[100dvh] w-full bg-gray-50 overflow-hidden relative">
            <DesktopSidebar />

            <div className="w-full h-full lg:flex-1 relative z-0 order-4">
                <Map />
            </div>

            <div className="hidden lg:flex h-full z-10 order-3">
                <PlaceDetailsPanel />
            </div>

            {isSchedulePanelOpen && (
                <div className="hidden lg:flex h-full z-10 order-2 border-r border-gray-200">
                    <DailySchedule />
                </div>
            )}

            <MobileDrawer />
        </div>
    );
}