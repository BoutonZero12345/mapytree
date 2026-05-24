import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDateStore } from '../store/useDateStore';
import Map from '../../maps/components/Map';
import Timeline from './Timeline';
import DailySchedule from './DailySchedule';
import PlaceDetailsModal from './PlaceDetailsModal';

export default function PlanningLayout() {
    const { id } = useParams();
    const navigate = useNavigate();
    const loadFromDb = useDateStore((state) => state.loadFromDb);
    const loadFavorites = useDateStore((state) => state.loadFavorites);
    const currentDateName = useDateStore((state) => state.currentDateName);

    // Modal de détails riches de lieu
    const activePlaceDetails = useDateStore((state) => state.activePlaceDetails);
    const setActivePlaceDetails = useDateStore((state) => state.setActivePlaceDetails);

    // États pour le tiroir mobile
    const [drawerHeight, setDrawerHeight] = useState('half'); // 'collapsed', 'half', 'expanded'
    const [mobileTab, setMobileTab] = useState('timeline'); // 'timeline', 'schedule'

    useEffect(() => {
        if (id) {
            loadFromDb(id);
        }
        if (loadFavorites) {
            loadFavorites();
        }
    }, [id, loadFromDb, loadFavorites]);

    const toggleDrawerHeight = () => {
        if (drawerHeight === 'collapsed') setDrawerHeight('half');
        else if (drawerHeight === 'half') setDrawerHeight('expanded');
        else setDrawerHeight('collapsed');
    };

    return (
        <div className="flex flex-col lg:flex-row h-[100dvh] w-full bg-gray-50 overflow-hidden relative">

            {/* 1. Sidebar Gauche (Édition du Planning - visible sur desktop seulement) */}
            <div className="hidden lg:flex flex-col h-full lg:w-[400px] xl:w-[450px] bg-white shadow-xl z-10 shrink-0 border-r border-gray-200">
                <div className="p-4 border-b flex items-center gap-3 shrink-0 bg-gray-50">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
                        title="Retour"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <h1 className="text-lg font-extrabold text-gray-800 truncate">{currentDateName || 'Chargement...'}</h1>
                </div>
                <div className="flex-1 overflow-hidden p-4">
                    <Timeline />
                </div>
            </div>

            {/* 2. Zone Carte (Prend 100% de l'écran sur mobile, flex-1 sur desktop) */}
            <div className="w-full h-full lg:flex-1 relative z-0 order-1">
                <Map />
            </div>

            {/* 3. Calendrier/Déroulé (Visible à droite sur desktop seulement) */}
            <div className="hidden lg:flex h-full z-10 order-3">
                <DailySchedule />
            </div>

            {/* 4. TIROIR COULISSANT MOBILE (Visible uniquement sur écrans < 1024px) */}
            <div 
                className={`fixed bottom-0 left-0 right-0 z-20 bg-white rounded-t-[28px] shadow-[0_-12px_30px_rgba(0,0,0,0.15)] border-t border-gray-200/60 flex flex-col transition-all duration-350 ease-out lg:hidden ${
                    drawerHeight === 'collapsed' ? 'h-[75px]' : drawerHeight === 'half' ? 'h-[48vh]' : 'h-[86vh]'
                }`}
            >
                {/* Poignée et Barre de déplacement tactile */}
                <div 
                    onClick={toggleDrawerHeight}
                    className="w-full py-2.5 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 shrink-0 select-none touch-pan-y"
                >
                    <div className="w-12 h-1 bg-gray-300 rounded-full mb-1"></div>
                </div>

                {/* En-tête mobile compact */}
                <div className="px-4 pb-2 border-b flex items-center justify-between shrink-0 h-[45px]">
                    <div className="flex items-center gap-1.5 overflow-hidden mr-2">
                        <button
                            onClick={() => navigate('/')}
                            className="p-1.5 hover:bg-gray-150 rounded-full text-gray-500 shrink-0"
                            title="Quitter"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <h1 className="text-xs font-black text-gray-800 truncate uppercase tracking-wider">{currentDateName || 'Mon Plan'}</h1>
                    </div>

                    {/* Onglets tactiles du tiroir */}
                    <div className="flex bg-gray-100 p-0.5 rounded-xl text-[10px] font-extrabold shadow-inner border border-gray-200/30">
                        <button
                            onClick={() => { setMobileTab('timeline'); if (drawerHeight === 'collapsed') setDrawerHeight('half'); }}
                            className={`px-3 py-1.5 rounded-lg transition-all ${mobileTab === 'timeline' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-gray-500'}`}
                        >
                            Édition / Favoris
                        </button>
                        <button
                            onClick={() => { setMobileTab('schedule'); if (drawerHeight === 'collapsed') setDrawerHeight('half'); }}
                            className={`px-3 py-1.5 rounded-lg transition-all ${mobileTab === 'schedule' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-gray-500'}`}
                        >
                            Déroulé (Planning)
                        </button>
                    </div>

                    {/* Actions de hauteur rapides */}
                    <div className="flex gap-1 items-center shrink-0">
                        <button 
                            onClick={() => setDrawerHeight(drawerHeight === 'collapsed' ? 'half' : 'collapsed')}
                            className="p-1.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-400"
                        >
                            {drawerHeight === 'collapsed' ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"></polyline></svg>
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Contenu dynamique du tiroir (Dépend de l'onglet actif et n'est pas rendu si réduit) */}
                <div className={`flex-1 overflow-hidden p-3 bg-white ${drawerHeight === 'collapsed' ? 'hidden' : 'block'}`}>
                    {mobileTab === 'timeline' ? (
                        <Timeline />
                    ) : (
                        <DailySchedule isMobile={true} />
                    )}
                </div>
            </div>

            {/* 5. MODAL DE DÉTAILS RICHES (Photos style Google Images, Avis, Horaires) */}
            {activePlaceDetails && (
                <PlaceDetailsModal 
                    place={activePlaceDetails} 
                    onClose={() => setActivePlaceDetails(null)} 
                />
            )}

        </div>
    );
}