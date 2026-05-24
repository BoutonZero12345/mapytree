import { useState, useEffect } from 'react';
import { useDateStore } from '../store/useDateStore';

export default function PlaceDetailsPanel({ isMobile = false }) {
    const activePlaceDetails = useDateStore((state) => state.activePlaceDetails);
    const setActivePlaceDetails = useDateStore((state) => state.setActivePlaceDetails);

    const [isExpanded, setIsExpanded] = useState(true);
    const [activeTab, setActiveTab] = useState('photos'); // 'photos', 'reviews', 'hours'

    // Ouvre automatiquement le panneau lorsqu'un nouveau lieu est sélectionné
    useEffect(() => {
        if (activePlaceDetails) {
            setIsExpanded(true);
        }
    }, [activePlaceDetails?.placeId]);
    const [fullScreenImage, setFullScreenImage] = useState(null);

    if (!activePlaceDetails) return null;

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
                            {!activePlaceDetails.photos || activePlaceDetails.photos.length === 0 ? (
                                <div className="text-center py-6 text-gray-400 text-xs">
                                    <p>Aucune photo disponible.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {activePlaceDetails.photos.map((url, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => setFullScreenImage(url)}
                                            className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:scale-[1.02] transition-all relative group border border-gray-200/50"
                                        >
                                            <img src={url} alt={`Photo ${i+1}`} className="w-full h-full object-cover" loading="lazy" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* REVIEWS SECTION */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-2">
                            {!activePlaceDetails.reviews || activePlaceDetails.reviews.length === 0 ? (
                                <div className="text-center py-6 text-gray-400 text-xs">
                                    <p>Aucun avis disponible.</p>
                                </div>
                            ) : (
                                activePlaceDetails.reviews.map((r, i) => (
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
                                ))
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
                                        
                                        return (
                                            <div 
                                                key={i} 
                                                className={`flex justify-between items-center py-1 px-2 rounded-lg text-[9px] font-bold ${
                                                    isToday 
                                                        ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' 
                                                        : 'text-gray-600'
                                                }`}
                                            >
                                                <span>{line.split(':')[0]}</span>
                                                <span className="font-extrabold">{line.split(':').slice(1).join(':').trim()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                </div>
                
                {/* Modal Plein Écran */}
                {fullScreenImage && (
                    <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col justify-center items-center p-4" onClick={() => setFullScreenImage(null)}>
                        <img src={fullScreenImage} alt="Agrandissement" className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl" />
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
                                    {!activePlaceDetails.photos || activePlaceDetails.photos.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-xs">
                                            <p>Aucune photo disponible.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            {activePlaceDetails.photos.map((url, i) => (
                                                <div 
                                                    key={i} 
                                                    onClick={() => setFullScreenImage(url)}
                                                    className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:scale-[1.02] transition-all relative group border border-gray-200/50"
                                                >
                                                    <img src={url} alt={`Photo ${i+1}`} className="w-full h-full object-cover" loading="lazy" />
                                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* REVIEWS SECTION */}
                            {activeTab === 'reviews' && (
                                <div className="space-y-3">
                                    {!activePlaceDetails.reviews || activePlaceDetails.reviews.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-xs">
                                            <p>Aucun avis disponible.</p>
                                        </div>
                                    ) : (
                                        activePlaceDetails.reviews.map((r, i) => (
                                            <div key={i} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
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
                                                    
                                                    <div className="flex items-center text-yellow-500 bg-yellow-50/50 px-1 py-0.2 rounded text-[9px] font-black border border-yellow-150/20 shrink-0">
                                                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                                        <span className="ml-0.5">{r.rating}</span>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-gray-600 mt-2 leading-relaxed whitespace-pre-line font-medium line-clamp-4 hover:line-clamp-none transition-all">{r.text}</p>
                                            </div>
                                        ))
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
                                                
                                                return (
                                                    <div 
                                                        key={i} 
                                                        className={`flex justify-between items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
                                                            isToday 
                                                                ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' 
                                                                : 'text-gray-600'
                                                        }`}
                                                    >
                                                        <span>{line.split(':')[0]}</span>
                                                        <span className="font-extrabold">{line.split(':').slice(1).join(':').trim()}</span>
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
            {fullScreenImage && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col justify-center items-center p-4 animate-in fade-in duration-200">
                    <button 
                        onClick={() => setFullScreenImage(null)}
                        className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 shadow-lg"
                        title="Fermer le plein écran"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <img 
                        src={fullScreenImage} 
                        alt="Agrandissement" 
                        className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-white/5 animate-in zoom-in-95 duration-200"
                    />
                </div>
            )}
        </div>
    );
}
