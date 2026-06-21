import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDateStore } from '../store/useDateStore';
import Map from '../../maps/components/Map';
import Timeline from './Timeline';
import DailySchedule from './DailySchedule';
import PlaceDetailsPanel from './PlaceDetailsPanel';

export default function PlanningLayout() {
    const { id } = useParams();
    const navigate = useNavigate();
    const loadFromDb = useDateStore((state) => state.loadFromDb);
    const loadFavorites = useDateStore((state) => state.loadFavorites);
    const currentDateName = useDateStore((state) => state.currentDateName);
    const isFavorite = useDateStore((state) => state.isFavorite);
    const togglePlanningFavorite = useDateStore((state) => state.togglePlanningFavorite);
    const currentDateId = useDateStore((state) => state.currentDateId);

    // Sélections globales de jours & visibilité du déroulé
    const isSchedulePanelOpen = useDateStore((state) => state.isSchedulePanelOpen);
    const selectedDays = useDateStore((state) => state.selectedDays || []);
    const setSelectedDays = useDateStore((state) => state.setSelectedDays);

    // Fiche de détails riches de lieu
    const activePlaceDetails = useDateStore((state) => state.activePlaceDetails);
    const setActivePlaceDetails = useDateStore((state) => state.setActivePlaceDetails);

    // États pour le tiroir mobile & sélecteur de jours
    const [drawerHeight, setDrawerHeight] = useState('half'); // 'collapsed', 'half', 'expanded'
    const [mobileTab, setMobileTab] = useState('timeline'); // 'timeline', 'schedule'
    const [isDaySelectorOpen, setIsDaySelectorOpen] = useState(false);

    useEffect(() => {
        if (id) {
            loadFromDb(id);
        }
        if (loadFavorites) {
            loadFavorites();
        }
    }, [id, loadFromDb, loadFavorites]);

    // Sur mobile, ouvre le tiroir d'informations du lieu dès qu'il est sélectionné
    useEffect(() => {
        if (activePlaceDetails) {
            setMobileTab('place');
            if (drawerHeight === 'collapsed') {
                setDrawerHeight('half');
            }
        }
    }, [activePlaceDetails]);

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
                    <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            <h1 className="text-base font-black text-gray-800 truncate leading-snug">{currentDateName || 'Chargement...'}</h1>
                            {currentDateId && (
                                <button
                                    onClick={() => togglePlanningFavorite(currentDateId)}
                                    className={`p-1 rounded-lg transition-all ${isFavorite ? 'text-yellow-500 hover:text-yellow-600 scale-105' : 'text-gray-300 hover:text-gray-450 hover:scale-105'}`}
                                    title="Favoris"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                </button>
                            )}
                        </div>
                        {selectedDays.length > 0 && (
                            <p className="text-[10px] font-extrabold text-blue-600 truncate mt-0.5 flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                {selectedDays.join(', ')}
                            </p>
                        )}
                    </div>

                    {/* Sélecteur Hebdomadaire de Jours */}
                    <div className="relative shrink-0">
                        <button
                            onClick={() => setIsDaySelectorOpen(!isDaySelectorOpen)}
                            className={`p-2 hover:bg-gray-200 rounded-xl transition-all border ${
                                selectedDays.length > 0 
                                    ? 'text-blue-600 bg-blue-50 border-blue-100 shadow-sm' 
                                    : 'text-gray-400 bg-white border-gray-250/60'
                            }`}
                            title="Choisir les jours de la semaine"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </button>
                        {isDaySelectorOpen && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setIsDaySelectorOpen(false)}></div>
                                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-250 rounded-2xl shadow-xl p-3.5 z-40 min-w-[280px] animate-in fade-in zoom-in-95 duration-150">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 select-none">Jours du planning</h3>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => {
                                            const isSelected = selectedDays.includes(day);
                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => {
                                                        const updated = isSelected 
                                                            ? selectedDays.filter(d => d !== day) 
                                                            : [...selectedDays, day];
                                                        setSelectedDays(updated);
                                                    }}
                                                    className={`px-2.5 py-1.5 text-[11px] font-extrabold rounded-xl border transition-all text-left flex items-center justify-between ${
                                                        isSelected 
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm font-black' 
                                                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    <span>{day}</span>
                                                    {isSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex-1 overflow-hidden p-4">
                    <Timeline />
                </div>
            </div>

            {/* 2. Zone Carte (Prend 100% de l'écran sur mobile, flex-1 sur desktop) */}
            <div className="w-full h-full lg:flex-1 relative z-0 order-4">
                <Map />
            </div>

            {/* 2.5. Panneau de Détails de Lieu (À droite du Déroulé sur desktop) */}
            <div className="hidden lg:flex h-full z-10 order-3">
                <PlaceDetailsPanel />
            </div>

            {/* 3. Calendrier/Déroulé (Masqué par défaut, s'affiche à l'ordre 2 à droite de la timeline) */}
            {isSchedulePanelOpen && (
                <div className="hidden lg:flex h-full z-10 order-2 border-r border-gray-200">
                    <DailySchedule />
                </div>
            )}

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
                    <div className="flex bg-gray-100 p-0.5 rounded-xl text-[10px] font-extrabold shadow-inner border border-gray-200/30 overflow-x-auto no-scrollbar max-w-[70vw] md:max-w-none">
                        <button
                            onClick={() => { setMobileTab('timeline'); if (drawerHeight === 'collapsed') setDrawerHeight('half'); }}
                            className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${mobileTab === 'timeline' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-gray-500'}`}
                        >
                            Édition / Favoris
                        </button>
                        <button
                            onClick={() => { setMobileTab('schedule'); if (drawerHeight === 'collapsed') setDrawerHeight('half'); }}
                            className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${mobileTab === 'schedule' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-gray-500'}`}
                        >
                            Déroulé (Planning)
                        </button>
                        {activePlaceDetails && (
                            <button
                                onClick={() => { setMobileTab('place'); if (drawerHeight === 'collapsed') setDrawerHeight('half'); }}
                                className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap animate-in fade-in duration-200 ${mobileTab === 'place' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-gray-500'}`}
                            >
                                Infos Lieu
                            </button>
                        )}
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
                    ) : mobileTab === 'schedule' ? (
                        <DailySchedule isMobile={true} />
                    ) : (
                        <PlaceDetailsPanel isMobile={true} />
                    )}
                </div>
            </div>

            {/* Rendu des volets et panneau latéral directement intégrés */}

        </div>
    );
}