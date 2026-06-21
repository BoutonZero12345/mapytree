import { useState, useEffect } from 'react';
import { useDateStore } from '../store/useDateStore';

const PARIS_STATION_CORRESPONDANCES = {
    'gare du nord': {
        metros: [
            { line: '4', color: '#b50070', textColor: '#ffffff' },
            { line: '5', color: '#f28d00', textColor: '#ffffff' }
        ],
        rers: [
            { line: 'B', color: '#3366cc', textColor: '#ffffff' },
            { line: 'D', color: '#008000', textColor: '#ffffff' },
            { line: 'E', color: '#ff00ff', textColor: '#ffffff' }
        ],
        trains: [
            { line: 'H', color: '#a64d79', textColor: '#ffffff' },
            { line: 'K', color: '#b6d7a8', textColor: '#000000' },
            { line: 'TER', color: '#76a5af', textColor: '#ffffff' },
            { line: 'TGV', color: '#666666', textColor: '#ffffff' },
            { line: 'Eurostar', color: '#03224c', textColor: '#ffffff' }
        ]
    },
    'gare de lyon': {
        metros: [
            { line: '1', color: '#ffcd00', textColor: '#000000' },
            { line: '14', color: '#660099', textColor: '#ffffff' }
        ],
        rers: [
            { line: 'A', color: '#ff3333', textColor: '#ffffff' },
            { line: 'D', color: '#008000', textColor: '#ffffff' }
        ],
        trains: [
            { line: 'R', color: '#e06666', textColor: '#ffffff' },
            { line: 'TER', color: '#76a5af', textColor: '#ffffff' },
            { line: 'TGV', color: '#666666', textColor: '#ffffff' }
        ]
    },
    'gare de l\'est': {
        metros: [
            { line: '4', color: '#b50070', textColor: '#ffffff' },
            { line: '5', color: '#f28d00', textColor: '#ffffff' },
            { line: '7', color: '#f37021', textColor: '#ffffff' }
        ],
        rers: [
            { line: 'E', color: '#ff00ff', textColor: '#ffffff' }
        ],
        trains: [
            { line: 'P', color: '#f6b26b', textColor: '#000000' },
            { line: 'TER', color: '#76a5af', textColor: '#ffffff' },
            { line: 'TGV', color: '#666666', textColor: '#ffffff' }
        ]
    },
    'gare montparnasse': {
        metros: [
            { line: '4', color: '#b50070', textColor: '#ffffff' },
            { line: '6', color: '#83c39f', textColor: '#000000' },
            { line: '12', color: '#007858', textColor: '#ffffff' },
            { line: '13', color: '#00af87', textColor: '#ffffff' }
        ],
        trains: [
            { line: 'N', color: '#008080', textColor: '#ffffff' },
            { line: 'TER', color: '#76a5af', textColor: '#ffffff' },
            { line: 'TGV', color: '#666666', textColor: '#ffffff' }
        ]
    },
    'gare saint-lazare': {
        metros: [
            { line: '3', color: '#9b9738', textColor: '#ffffff' },
            { line: '12', color: '#007858', textColor: '#ffffff' },
            { line: '13', color: '#00af87', textColor: '#ffffff' },
            { line: '14', color: '#660099', textColor: '#ffffff' }
        ],
        rers: [
            { line: 'E', color: '#ff00ff', textColor: '#ffffff' }
        ],
        trains: [
            { line: 'J', color: '#cc9900', textColor: '#ffffff' },
            { line: 'L', color: '#674ea7', textColor: '#ffffff' },
            { line: 'TER', color: '#76a5af', textColor: '#ffffff' }
        ]
    },
    'châtelet': {
        metros: [
            { line: '1', color: '#ffcd00', textColor: '#000000' },
            { line: '4', color: '#b50070', textColor: '#ffffff' },
            { line: '7', color: '#f37021', textColor: '#ffffff' },
            { line: '11', color: '#8c593c', textColor: '#ffffff' },
            { line: '14', color: '#660099', textColor: '#ffffff' }
        ],
        rers: [
            { line: 'A', color: '#ff3333', textColor: '#ffffff' },
            { line: 'B', color: '#3366cc', textColor: '#ffffff' },
            { line: 'D', color: '#008000', textColor: '#ffffff' }
        ]
    },
    'gare d\'austerlitz': {
        metros: [
            { line: '5', color: '#f28d00', textColor: '#ffffff' },
            { line: '10', color: '#e3b32a', textColor: '#000000' }
        ],
        rers: [
            { line: 'C', color: '#ffd966', textColor: '#000000' }
        ],
        trains: [
            { line: 'TER', color: '#76a5af', textColor: '#ffffff' }
        ]
    },
    'gare de bercy': {
        metros: [
            { line: '6', color: '#83c39f', textColor: '#000000' },
            { line: '14', color: '#660099', textColor: '#ffffff' }
        ],
        trains: [
            { line: 'TER', color: '#76a5af', textColor: '#ffffff' }
        ]
    }
};

const getStationCorrespondances = (name = '', address = '') => {
    const key = Object.keys(PARIS_STATION_CORRESPONDANCES).find(k => 
        name.toLowerCase().includes(k) || address.toLowerCase().includes(k)
    );
    
    if (key) {
        return PARIS_STATION_CORRESPONDANCES[key];
    }
    
    const nameLower = name.toLowerCase();
    const result = { metros: [], rers: [], trains: [] };
    
    const metroMatches = nameLower.match(/(?:métro|ligne|m)\s*([1-9]|1[0-4])/gi);
    if (metroMatches) {
        metroMatches.forEach(match => {
            const num = match.match(/([1-9]|1[0-4])/)[0];
            const colors = {
                '1': '#ffcd00', '2': '#003ca6', '3': '#9b9738', '3b': '#98d4e2',
                '4': '#b50070', '5': '#f28d00', '6': '#83c39f', '7': '#f37021',
                '7b': '#98d4e2', '8': '#e3b32a', '9': '#b5e32d', '10': '#dfb039',
                '11': '#8c593c', '12': '#007858', '13': '#00af87', '14': '#660099'
            };
            if (!result.metros.some(m => m.line === num)) {
                result.metros.push({ line: num, color: colors[num] || '#3b82f6', textColor: '#ffffff' });
            }
        });
    } else if (nameLower.includes('métro') || nameLower.includes('subway') || nameLower.includes('station')) {
        result.metros.push({ line: 'M', color: '#1e3a8a', textColor: '#ffffff' });
    }
    
    const rerMatches = nameLower.match(/rer\s*([a-e])/gi);
    if (rerMatches) {
        rerMatches.forEach(match => {
            const letter = match.match(/([a-e])/i)[0].toUpperCase();
            const colors = { 'A': '#ff3333', 'B': '#3366cc', 'C': '#ffd966', 'D': '#008000', 'E': '#ff00ff' };
            if (!result.rers.some(r => r.line === letter)) {
                result.rers.push({ line: letter, color: colors[letter] || '#8b5cf6', textColor: '#ffffff' });
            }
        });
    } else if (nameLower.includes('rer')) {
        result.rers.push({ line: 'RER', color: '#0f766e', textColor: '#ffffff' });
    }
    
    if (nameLower.includes('train') || nameLower.includes('sncf') || nameLower.includes('gare')) {
        result.trains.push({ line: 'TER', color: '#76a5af', textColor: '#ffffff' });
        result.trains.push({ line: 'SNCF', color: '#03224c', textColor: '#ffffff' });
    }
    
    return result;
};

export default function PlaceDetailsPanel({ isMobile = false }) {
    const activePlaceDetails = useDateStore((state) => state.activePlaceDetails);
    const setActivePlaceDetails = useDateStore((state) => state.setActivePlaceDetails);
    const selectedDays = useDateStore((state) => state.selectedDays || []);
    
    const fetchPlacePhotos = useDateStore((state) => state.fetchPlacePhotos);
    const fetchPlaceReviews = useDateStore((state) => state.fetchPlaceReviews);

    const [isExpanded, setIsExpanded] = useState(true);
    const [activeTab, setActiveTab] = useState('photos'); // 'photos', 'reviews', 'hours'
    const [visiblePhotosCount, setVisiblePhotosCount] = useState(10);
    const [visibleReviewsCount, setVisibleReviewsCount] = useState(10);
    const [fullScreenImageIndex, setFullScreenImageIndex] = useState(null);

    // Ouvre automatiquement le panneau et réinitialise les limites d'affichage lorsqu'un nouveau lieu est sélectionné
    useEffect(() => {
        if (activePlaceDetails) {
            setIsExpanded(true);
            setVisiblePhotosCount(10);
            setVisibleReviewsCount(10);
            setFullScreenImageIndex(null);
        }
    }, [activePlaceDetails?.placeId]);

    // Chargement différé et paresseux (Lazy loading) des photos et avis au changement d'onglet
    useEffect(() => {
        if (!activePlaceDetails?.placeId) return;
        if (activeTab === 'photos' && !activePlaceDetails.photos) {
            fetchPlacePhotos(activePlaceDetails.placeId);
        } else if (activeTab === 'reviews' && !activePlaceDetails.reviews) {
            fetchPlaceReviews(activePlaceDetails.placeId);
        }
    }, [activeTab, activePlaceDetails?.placeId, fetchPlacePhotos, fetchPlaceReviews, activePlaceDetails?.photos, activePlaceDetails?.reviews]);

    // Écouteur pour la navigation clavier dans la visionneuse plein écran
    useEffect(() => {
        if (fullScreenImageIndex === null) return;

        const handleKeyDown = (e) => {
            // Ignorer si l'utilisateur est en train de saisir du texte dans un champ de saisie
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable) {
                return;
            }
            const photosCount = activePlaceDetails?.photos?.length || 0;
            if (e.key === 'ArrowRight') {
                setFullScreenImageIndex((prev) => (prev !== null && prev < photosCount - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowLeft') {
                setFullScreenImageIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
            } else if (e.key === 'Escape') {
                setFullScreenImageIndex(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [fullScreenImageIndex, activePlaceDetails?.photos]);

    if (!activePlaceDetails) return null;

    const isTransitStation = activePlaceDetails && (
        activePlaceDetails.types?.some(t => ['transit_station', 'subway_station', 'train_station', 'bus_station'].includes(t)) ||
        /gare|station\s|métro|subway|rer|tramway/i.test(activePlaceDetails.name) ||
        /gare|station\s|métro|subway|rer|tramway/i.test(activePlaceDetails.address)
    );
    const stationData = isTransitStation ? getStationCorrespondances(activePlaceDetails.name, activePlaceDetails.address) : null;

    const getPriceLabel = (level) => {
        if (!level) return 'Non spécifié';
        return '€'.repeat(level);
    };

    const toggleExpanded = () => setIsExpanded(!isExpanded);

    // --- RENDU MOBILE : Rendu simplifié sans bordures de volet ni boutons de réduction de barre ---
    if (isMobile) {
        return (
            <div className="bg-white flex flex-col h-full w-full overflow-hidden">
                {/* Infos principales */}
                <div className="p-3 border-b shrink-0 bg-white">
                    <div className="flex justify-between items-start gap-2">
                        <div className="overflow-hidden">
                            <h3 className="font-extrabold text-sm text-gray-800 truncate leading-snug">{activePlaceDetails.name}</h3>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">{activePlaceDetails.address}</p>

                            {/* NOUVEAU : Correspondances pour les gares et stations */}
                            {isTransitStation && stationData && (
                                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 mt-2 flex flex-col gap-1.5 shadow-inner select-none animate-in fade-in duration-200">
                                    <h4 className="text-[8px] font-black uppercase text-gray-400 tracking-wider">Correspondances & Lignes</h4>
                                    <div className="flex flex-col gap-1.5">
                                        {/* Métros */}
                                        {stationData.metros.length > 0 && (
                                            <div className="flex items-center gap-1 flex-wrap">
                                                <span className="text-[8px] font-black text-gray-400 uppercase w-10">Métro :</span>
                                                {stationData.metros.map((m, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className="flex items-center justify-center font-black text-[8px] rounded-full w-4 h-4 shadow-sm border border-black/5 shrink-0" 
                                                        style={{ backgroundColor: m.color, color: m.textColor }}
                                                    >
                                                        {m.line}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* RER */}
                                        {stationData.rers.length > 0 && (
                                            <div className="flex items-center gap-1 flex-wrap">
                                                <span className="text-[8px] font-black text-gray-400 uppercase w-10">RER :</span>
                                                {stationData.rers.map((r, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className="flex items-center justify-center font-black text-[8px] rounded-md w-4 h-4 shadow-sm border border-black/5 shrink-0" 
                                                        style={{ backgroundColor: r.color, color: r.textColor }}
                                                    >
                                                        {r.line}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Trains */}
                                        {stationData.trains.length > 0 && (
                                            <div className="flex items-center gap-1 flex-wrap">
                                                <span className="text-[8px] font-black text-gray-400 uppercase w-10">Train :</span>
                                                {stationData.trains.map((t, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className="flex items-center justify-center font-black text-[7px] rounded px-1 py-0.5 shadow-sm border border-black/5 shrink-0" 
                                                        style={{ backgroundColor: t.color, color: t.textColor }}
                                                    >
                                                        {t.line}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setActivePlaceDetails(null)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0 shadow-sm border bg-white"
                            title="Fermer"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        {activePlaceDetails.rating && (
                            <div className="flex items-center text-yellow-500 bg-yellow-50 px-1.5 py-0.5 rounded-md border border-yellow-100/50 text-[10px] font-bold">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                <span className="ml-0.5 text-yellow-700 font-extrabold">{activePlaceDetails.rating}</span>
                                <span className="text-[9px] text-yellow-600/70 font-medium ml-1">({activePlaceDetails.userRatingsTotal?.toLocaleString()})</span>
                            </div>
                        )}
                        {activePlaceDetails.priceLevel && (
                            <div className="flex items-center text-green-700 bg-green-50 px-1.5 py-0.5 rounded-md border border-green-100 text-[10px] font-bold">
                                💶 <span className="ml-0.5 font-extrabold">{getPriceLabel(activePlaceDetails.priceLevel)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Onglets tactiles */}
                <div className="flex bg-white px-3 pt-2 border-b shrink-0 gap-3 text-xs font-bold">
                    <button
                        onClick={() => setActiveTab('photos')}
                        className={`pb-2 transition-all border-b-2 ${activeTab === 'photos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Photos ({activePlaceDetails.photos?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`pb-2 transition-all border-b-2 ${activeTab === 'reviews' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Avis ({activePlaceDetails.reviews?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('hours')}
                        className={`pb-2 transition-all border-b-2 ${activeTab === 'hours' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Horaires
                    </button>
                </div>

                {/* Contenu Défilant */}
                <div className="flex-1 overflow-y-auto p-3 bg-slate-50/50 no-scrollbar">
                    
                    {/* PHOTOS SECTION */}
                    {activeTab === 'photos' && (
                        <div>
                            {!activePlaceDetails.photos ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400 select-none animate-pulse">
                                    <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-550">Chargement des photos...</span>
                                </div>
                            ) : activePlaceDetails.photos.length === 0 ? (
                                <div className="text-center py-6 text-gray-400 text-xs">
                                    <p>Aucune photo disponible.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {activePlaceDetails.photos.slice(0, visiblePhotosCount).map((url, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => setFullScreenImageIndex(i)}
                                            className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:scale-[1.02] transition-all relative group border border-gray-200/50"
                                        >
                                            <img src={url} alt={`Photo ${i+1}`} className="w-full h-full object-cover" loading="lazy" />
                                        </div>
                                    ))}
                                    {activePlaceDetails.photos.length > visiblePhotosCount && (
                                        <div className="col-span-2 flex justify-center mt-2">
                                            {visiblePhotosCount === 10 ? (
                                                <button
                                                    onClick={() => setVisiblePhotosCount(30)}
                                                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl text-[10px] font-extrabold transition-all border border-blue-150/20 shadow-xs"
                                                >
                                                    Voir plus de photos (30 max)
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setVisiblePhotosCount(activePlaceDetails.photos.length)}
                                                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl text-[10px] font-extrabold transition-all shadow-xs"
                                                >
                                                    Voir toutes les photos ({activePlaceDetails.photos.length})
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* REVIEWS SECTION */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-2">
                            {!activePlaceDetails.reviews ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400 select-none animate-pulse">
                                    <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-550">Chargement des avis...</span>
                                </div>
                            ) : activePlaceDetails.reviews.length === 0 ? (
                                <div className="text-center py-6 text-gray-400 text-xs">
                                    <p>Aucun avis disponible.</p>
                                </div>
                            ) : (
                                <>
                                    {activePlaceDetails.reviews.slice(0, visibleReviewsCount).map((r, i) => (
                                        <div key={i} className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    {r.avatar ? (
                                                        <img src={r.avatar} alt={r.author} className="w-5 h-5 rounded-full border border-gray-100 shrink-0" />
                                                    ) : (
                                                        <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full font-bold flex items-center justify-center shrink-0 text-[9px]">
                                                            {r.author[0]}
                                                        </div>
                                                    )}
                                                    <div className="overflow-hidden">
                                                        <h4 className="font-extrabold text-[9px] text-gray-800 leading-tight truncate w-24">{r.author}</h4>
                                                        <span className="text-[7px] text-gray-400 font-medium">{r.time}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center text-yellow-500 bg-yellow-50/50 px-1 py-0.2 rounded text-[8px] font-black border border-yellow-150/15 shrink-0">
                                                    <span className="ml-0.5">{r.rating} ⭐</span>
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-gray-650 mt-1.5 leading-normal whitespace-pre-line font-medium">{r.text}</p>
                                        </div>
                                    ))}
                                    {activePlaceDetails.reviews.length > visibleReviewsCount && (
                                        <div className="flex justify-center mt-2">
                                            {visibleReviewsCount === 10 ? (
                                                <button
                                                    onClick={() => setVisibleReviewsCount(30)}
                                                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl text-[10px] font-extrabold transition-all border border-blue-150/20 shadow-xs"
                                                >
                                                    Voir plus d'avis (30 max)
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setVisibleReviewsCount(100)}
                                                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl text-[10px] font-extrabold transition-all shadow-xs"
                                                >
                                                    Voir tous les avis ({activePlaceDetails.reviews.length})
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* HOURS SECTION */}
                    {activeTab === 'hours' && (
                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                            {!activePlaceDetails.openingHours || activePlaceDetails.openingHours.length === 0 ? (
                                <div className="text-center py-4 text-gray-400 text-xs">
                                    <p>Aucun horaire disponible.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    {activePlaceDetails.openingHours.map((line, i) => {
                                        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                                        const todayIndex = new Date().getDay();
                                        const isToday = line.startsWith(days[todayIndex]);
                                        const isSelectedDay = selectedDays.some(day => line.toLowerCase().startsWith(day.toLowerCase()));
                                        
                                        let highlightClass = 'text-gray-600 border-transparent';
                                        if (isSelectedDay) {
                                            highlightClass = 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm font-black';
                                        } else if (isToday) {
                                            highlightClass = 'bg-amber-50 text-amber-850 border-amber-150 shadow-xs';
                                        }
                                        
                                        return (
                                            <div 
                                                key={i} 
                                                className={`flex justify-between items-center py-1 px-2 rounded-lg text-[9px] font-bold border ${highlightClass}`}
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    {isSelectedDay && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>}
                                                    {line.split(':')[0]}
                                                </span>
                                                <span className={`font-extrabold ${isSelectedDay ? 'text-blue-800' : ''}`}>{line.split(':').slice(1).join(':').trim()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                </div>
                
                {/* Modal Plein Écran */}
                {fullScreenImageIndex !== null && (
                    <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col justify-center items-center p-4 animate-in fade-in duration-200" onClick={() => setFullScreenImageIndex(null)}>
                        {/* Bouton de fermeture */}
                        <button 
                            onClick={() => setFullScreenImageIndex(null)}
                            className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 shadow-lg z-[210]"
                            title="Fermer le plein écran"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        {/* Flèche Gauche */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setFullScreenImageIndex(prev => prev > 0 ? prev - 1 : prev); }}
                            disabled={fullScreenImageIndex === 0}
                            className="absolute left-4 p-3 bg-black/40 hover:bg-black/60 disabled:opacity-20 text-white rounded-full transition-all border border-white/10 z-[210] disabled:cursor-not-allowed"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>

                        {/* Image */}
                        <img 
                            src={activePlaceDetails.largePhotos?.[fullScreenImageIndex] || activePlaceDetails.photos?.[fullScreenImageIndex]} 
                            alt="Agrandissement" 
                            className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl animate-in zoom-in-95 duration-200" 
                        />

                        {/* Flèche Droite */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setFullScreenImageIndex(prev => prev < (activePlaceDetails.photos?.length || 0) - 1 ? prev + 1 : prev); }}
                            disabled={fullScreenImageIndex === (activePlaceDetails.photos?.length || 0) - 1}
                            className="absolute right-4 p-3 bg-black/40 hover:bg-black/60 disabled:opacity-20 text-white rounded-full transition-all border border-white/10 z-[210] disabled:cursor-not-allowed"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>

                        {/* Indicateur de position */}
                        <span className="absolute bottom-6 bg-black/50 border border-white/10 text-white px-3 py-1 rounded-full text-xs font-semibold select-none">
                            {fullScreenImageIndex + 1} / {activePlaceDetails.photos?.length}
                        </span>
                    </div>
                )}
            </div>
        );
    }

    // --- RENDU DESKTOP : Rendu unifié pour gérer la transition fluide de largeur ---
    return (
        <div className={`bg-white shadow-xl z-20 flex flex-col border-l border-gray-200 overflow-hidden shrink-0 hidden lg:flex transition-[width] duration-300 ease-in-out ${isExpanded ? 'w-[280px] xl:w-[350px]' : 'w-[60px]'}`}>
            {!isExpanded ? (
                /* Rendu quand Replié */
                <div className="flex flex-col items-center py-4 gap-6 h-full animate-in fade-in duration-200">
                    {/* Bouton pour agrandir */}
                    <button
                        onClick={toggleExpanded}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors shrink-0"
                        title="Agrandir les infos du lieu"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>

                    {/* Titre vertical */}
                    <span 
                        className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap select-none cursor-pointer hover:text-blue-600 transition-colors"
                        style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                        onClick={toggleExpanded}
                    >
                        Infos Lieu
                    </span>
                </div>
            ) : (
                /* Rendu quand Déplié */
                <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-350">
                    {/* En-tête du volet */}
                    <div className="border-b flex items-center justify-between shrink-0 bg-gray-50 h-[60px] px-4">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <button
                                onClick={toggleExpanded}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors shrink-0"
                                title="Réduire les infos"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                            <h2 className="text-xs font-black text-gray-800 uppercase tracking-tight truncate whitespace-nowrap">
                                Infos Lieu
                            </h2>
                        </div>

                        {/* Bouton de fermeture complète */}
                        <button
                            onClick={() => setActivePlaceDetails(null)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0"
                            title="Fermer la fiche"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    {/* Contenu de la fiche */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Infos principales */}
                        <div className="p-4 border-b shrink-0 bg-white">
                            <h3 className="font-extrabold text-sm text-gray-800 truncate leading-snug">{activePlaceDetails.name}</h3>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">{activePlaceDetails.address}</p>

                            {/* NOUVEAU : Correspondances pour les gares et stations */}
                            {isTransitStation && stationData && (
                                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 mt-3 flex flex-col gap-2 shadow-inner select-none animate-in fade-in duration-200">
                                    <h4 className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Correspondances & Lignes</h4>
                                    <div className="flex flex-col gap-2">
                                        {/* Métros */}
                                        {stationData.metros.length > 0 && (
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[9px] font-black text-gray-400 uppercase w-12">Métro :</span>
                                                {stationData.metros.map((m, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className="flex items-center justify-center font-black text-[9px] rounded-full w-5 h-5 shadow-sm border border-black/5 shrink-0" 
                                                        style={{ backgroundColor: m.color, color: m.textColor }}
                                                    >
                                                        {m.line}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* RER */}
                                        {stationData.rers.length > 0 && (
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[9px] font-black text-gray-400 uppercase w-12">RER :</span>
                                                {stationData.rers.map((r, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className="flex items-center justify-center font-black text-[9px] rounded-md w-5 h-5 shadow-sm border border-black/5 shrink-0" 
                                                        style={{ backgroundColor: r.color, color: r.textColor }}
                                                    >
                                                        {r.line}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Trains */}
                                        {stationData.trains.length > 0 && (
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[9px] font-black text-gray-400 uppercase w-12">Train :</span>
                                                {stationData.trains.map((t, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className="flex items-center justify-center font-black text-[8px] rounded px-1.5 py-0.5 shadow-sm border border-black/5 shrink-0" 
                                                        style={{ backgroundColor: t.color, color: t.textColor }}
                                                    >
                                                        {t.line}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {activePlaceDetails.rating && (
                                    <div className="flex items-center text-yellow-500 bg-yellow-50 px-1.5 py-0.5 rounded-md border border-yellow-100/50 text-[10px] font-bold">
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                        <span className="ml-0.5 text-yellow-700 font-extrabold">{activePlaceDetails.rating}</span>
                                        <span className="text-[9px] text-yellow-600/70 font-medium ml-1">({activePlaceDetails.userRatingsTotal?.toLocaleString()})</span>
                                    </div>
                                )}
                                {activePlaceDetails.priceLevel && (
                                    <div className="flex items-center text-green-700 bg-green-50 px-1.5 py-0.5 rounded-md border border-green-100 text-[10px] font-bold">
                                        💶 <span className="ml-0.5 font-extrabold">{getPriceLabel(activePlaceDetails.priceLevel)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Onglets tactiles */}
                        <div className="flex bg-white px-3 pt-2 border-b shrink-0 gap-3 text-xs font-bold">
                            <button
                                onClick={() => setActiveTab('photos')}
                                className={`pb-2 transition-all border-b-2 ${activeTab === 'photos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                Photos ({activePlaceDetails.photos?.length || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`pb-2 transition-all border-b-2 ${activeTab === 'reviews' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                Avis ({activePlaceDetails.reviews?.length || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab('hours')}
                                className={`pb-2 transition-all border-b-2 ${activeTab === 'hours' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                Horaires
                            </button>
                        </div>

                        {/* Contenu Défilant */}
                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 no-scrollbar">
                            
                            {/* PHOTOS SECTION */}
                            {activeTab === 'photos' && (
                                <div>
                                    {!activePlaceDetails.photos ? (
                                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 select-none animate-pulse">
                                            <svg className="animate-spin h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="text-xs font-black uppercase tracking-wider text-blue-550">Chargement des photos...</span>
                                        </div>
                                    ) : activePlaceDetails.photos.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-xs">
                                            <p>Aucune photo disponible.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            {activePlaceDetails.photos.slice(0, visiblePhotosCount).map((url, i) => (
                                                <div 
                                                    key={i} 
                                                    onClick={() => setFullScreenImageIndex(i)}
                                                    className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:scale-[1.02] transition-all relative group border border-gray-200/50"
                                                >
                                                    <img src={url} alt={`Photo ${i+1}`} className="w-full h-full object-cover" loading="lazy" />
                                                    <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                                    </div>
                                                </div>
                                            ))}
                                            {activePlaceDetails.photos.length > visiblePhotosCount && (
                                                <div className="col-span-2 flex justify-center mt-3">
                                                    {visiblePhotosCount === 10 ? (
                                                        <button
                                                            onClick={() => setVisiblePhotosCount(30)}
                                                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-5 py-2.5 rounded-xl text-xs font-black transition-all border border-blue-150/20 shadow-xs"
                                                        >
                                                            Voir plus de photos (30 max)
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setVisiblePhotosCount(activePlaceDetails.photos.length)}
                                                            className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-xs"
                                                        >
                                                            Voir toutes les photos ({activePlaceDetails.photos.length})
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* REVIEWS SECTION */}
                            {activeTab === 'reviews' && (
                                <div className="space-y-3">
                                    {!activePlaceDetails.reviews ? (
                                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 select-none animate-pulse">
                                            <svg className="animate-spin h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="text-xs font-black uppercase tracking-wider text-blue-550">Chargement des avis...</span>
                                        </div>
                                    ) : activePlaceDetails.reviews.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-xs">
                                            <p>Aucun avis disponible.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {activePlaceDetails.reviews.slice(0, visibleReviewsCount).map((r, i) => (
                                                <div key={i} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="flex items-center gap-2">
                                                            {r.avatar ? (
                                                                <img src={r.avatar} alt={r.author} className="w-6 h-6 rounded-full border border-gray-100 shrink-0" />
                                                            ) : (
                                                                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full font-bold flex items-center justify-center shrink-0 text-[10px]">
                                                                    {r.author[0]}
                                                                </div>
                                                            )}
                                                            <div className="overflow-hidden">
                                                                <h4 className="font-extrabold text-[10px] text-gray-800 leading-tight truncate w-32">{r.author}</h4>
                                                                <span className="text-[8px] text-gray-400 font-medium">{r.time}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center text-yellow-500 bg-yellow-50/50 px-1 py-0.2 rounded text-[9px] font-black border border-yellow-150/20 shrink-0 animate-in fade-in duration-200">
                                                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                                            <span className="ml-0.5">{r.rating}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-gray-600 mt-2 leading-relaxed whitespace-pre-line font-medium">{r.text}</p>
                                                </div>
                                            ))}
                                            {activePlaceDetails.reviews.length > visibleReviewsCount && (
                                                <div className="flex justify-center mt-3">
                                                    {visibleReviewsCount === 10 ? (
                                                        <button
                                                            onClick={() => setVisibleReviewsCount(30)}
                                                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-5 py-2.5 rounded-xl text-xs font-black transition-all border border-blue-150/20 shadow-xs"
                                                        >
                                                            Voir plus d'avis (30 max)
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setVisibleReviewsCount(100)}
                                                            className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-xs"
                                                        >
                                                            Voir tous les avis ({activePlaceDetails.reviews.length})
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* HOURS SECTION */}
                            {activeTab === 'hours' && (
                                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                    {!activePlaceDetails.openingHours || activePlaceDetails.openingHours.length === 0 ? (
                                        <div className="text-center py-4 text-gray-400 text-xs">
                                            <p>Aucun horaire disponible.</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {activePlaceDetails.openingHours.map((line, i) => {
                                                const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                                                const todayIndex = new Date().getDay();
                                                const isToday = line.startsWith(days[todayIndex]);
                                                const isSelectedDay = selectedDays.some(day => line.toLowerCase().startsWith(day.toLowerCase()));
                                                
                                                let highlightClass = 'text-gray-650 border-transparent';
                                                if (isSelectedDay) {
                                                    highlightClass = 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm font-black';
                                                } else if (isToday) {
                                                    highlightClass = 'bg-amber-50 text-amber-850 border-amber-150 shadow-xs';
                                                }
                                                
                                                return (
                                                    <div 
                                                        key={i} 
                                                        className={`flex justify-between items-center py-1.5 px-2.5 rounded-lg text-[10px] font-bold border ${highlightClass}`}
                                                    >
                                                        <span className="flex items-center gap-1.5">
                                                            {isSelectedDay && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>}
                                                            {line.split(':')[0]}
                                                        </span>
                                                        <span className={`font-extrabold ${isSelectedDay ? 'text-blue-800' : ''}`}>{line.split(':').slice(1).join(':').trim()}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

            {/* Modal Image Plein Écran immersive */}
            {fullScreenImageIndex !== null && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col justify-center items-center p-4 animate-in fade-in duration-200" onClick={() => setFullScreenImageIndex(null)}>
                    {/* Bouton de fermeture */}
                    <button 
                        onClick={() => setFullScreenImageIndex(null)}
                        className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 shadow-lg z-[210] hover:scale-105 duration-150"
                        title="Fermer le plein écran"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                    {/* Flèche Gauche */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setFullScreenImageIndex(prev => prev > 0 ? prev - 1 : prev); }}
                        disabled={fullScreenImageIndex === 0}
                        className="absolute left-6 p-3.5 bg-black/40 hover:bg-black/60 disabled:opacity-20 text-white rounded-full transition-all border border-white/10 z-[210] disabled:cursor-not-allowed hover:scale-105 duration-150"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>

                    {/* Image Haute Résolution */}
                    <img 
                        src={activePlaceDetails.largePhotos?.[fullScreenImageIndex] || activePlaceDetails.photos?.[fullScreenImageIndex]} 
                        alt="Agrandissement" 
                        className="max-w-[85vw] max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-white/5 animate-in zoom-in-95 duration-200"
                    />

                    {/* Flèche Droite */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setFullScreenImageIndex(prev => prev < (activePlaceDetails.photos?.length || 0) - 1 ? prev + 1 : prev); }}
                        disabled={fullScreenImageIndex === (activePlaceDetails.photos?.length || 0) - 1}
                        className="absolute right-6 p-3.5 bg-black/40 hover:bg-black/60 disabled:opacity-20 text-white rounded-full transition-all border border-white/10 z-[210] disabled:cursor-not-allowed hover:scale-105 duration-150"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>

                    {/* Indicateur de position */}
                    <span className="absolute bottom-6 bg-black/50 border border-white/10 text-white px-4 py-1.5 rounded-full text-xs font-black select-none tracking-wide shadow-md">
                        {fullScreenImageIndex + 1} / {activePlaceDetails.photos?.length}
                    </span>
                </div>
            )}
        </div>
    );
}
