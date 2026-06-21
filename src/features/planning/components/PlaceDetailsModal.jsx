import { useState } from 'react';

export default function PlaceDetailsModal({ place, onClose }) {
    const hasPhotos = place.photos && place.photos.length > 0;
    const hasReviews = place.reviews && place.reviews.length > 0;
    const hasHours = place.openingHours && place.openingHours.length > 0;

    const [activeTab, setActiveTab] = useState(
        hasPhotos ? 'photos' : hasReviews ? 'reviews' : hasHours ? 'hours' : 'photos'
    );
    const [fullScreenImage, setFullScreenImage] = useState(null);

    if (!place) return null;

    // Prix indicatif
    const getPriceLabel = (level) => {
        if (!level) return 'Non spécifié';
        return '€'.repeat(level) + ` (${level === 1 ? 'Économique' : level === 2 ? 'Modéré' : level === 3 ? 'Cher' : 'Très cher'})`;
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop flouté */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Container Modal principal (Responsive : tiroir sur mobile, centré sur desktop) */}
            <div className="relative bg-white w-full max-w-2xl max-h-[85vh] md:max-h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-250 z-10">
                
                {/* En-tête de la fiche de détails */}
                <div className="p-5 border-b bg-gray-50 flex justify-between items-start shrink-0">
                    <div className="flex-1 overflow-hidden pr-4">
                        <h2 className="text-xl font-extrabold text-gray-800 truncate leading-snug">{place.name}</h2>
                        <p className="text-xs text-gray-500 truncate mt-1">{place.address}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs font-bold">
                            {place.rating && (
                                <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100/50">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    <span className="ml-1 text-yellow-700 font-extrabold">{place.rating}</span>
                                    <span className="text-[10px] text-yellow-600/70 font-medium ml-1">({place.userRatingsTotal?.toLocaleString()} avis)</span>
                                </div>
                            )}
                            <div className="flex items-center text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-150/40">
                                💶 <span className="ml-1">{getPriceLabel(place.priceLevel)}</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-full transition-colors shrink-0 shadow-sm border bg-white"
                        title="Fermer"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Tabs de Navigation interne */}
                <div className="flex bg-white px-5 pt-3 border-b shrink-0 gap-4 text-sm font-extrabold">
                    {hasPhotos && (
                        <button
                            onClick={() => setActiveTab('photos')}
                            className={`pb-2.5 transition-all border-b-2 ${activeTab === 'photos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Photos ({place.photos.length})
                        </button>
                    )}
                    {hasReviews && (
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`pb-2.5 transition-all border-b-2 ${activeTab === 'reviews' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Avis ({place.reviews.length})
                        </button>
                    )}
                    {hasHours && (
                        <button
                            onClick={() => setActiveTab('hours')}
                            className={`pb-2.5 transition-all border-b-2 ${activeTab === 'hours' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Horaires
                        </button>
                    )}
                </div>

                {/* Zone de contenu principale de la Modal (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-5 no-scrollbar bg-slate-50/50">
                    
                    {/* TAB PHOTOS : Grille d'images style Google Image */}
                    {activeTab === 'photos' && (
                        <div>
                            {!place.photos || place.photos.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p className="text-sm">Aucune photo disponible pour ce lieu.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {place.photos.map((url, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => setFullScreenImage(url)}
                                            className="aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:scale-[1.02] hover:shadow-md transition-all group relative border border-gray-200/50"
                                        >
                                            <img src={url} alt={`Photo ${i+1}`} className="w-full h-full object-cover" loading="lazy" />
                                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB REVIEWS : Liste de commentaires/avis */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-4">
                            {!place.reviews || place.reviews.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p className="text-sm">Aucun commentaire disponible pour ce lieu.</p>
                                </div>
                            ) : (
                                place.reviews.map((r, i) => (
                                    <div key={i} className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex items-center gap-2.5">
                                                {r.avatar ? (
                                                    <img src={r.avatar} alt={r.author} className="w-8 h-8 rounded-full border border-gray-100 shrink-0" />
                                                ) : (
                                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold flex items-center justify-center shrink-0 text-xs">
                                                        {r.author[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-extrabold text-xs text-gray-800 leading-tight">{r.author}</h4>
                                                    <span className="text-[10px] text-gray-400 font-medium">{r.time}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center text-yellow-500 bg-yellow-50/50 px-1.5 py-0.5 rounded-lg border border-yellow-150/30">
                                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                                <span className="text-[10px] font-black ml-0.5">{r.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2.5 leading-relaxed whitespace-pre-line font-medium">{r.text}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* TAB HOURS : Liste d'horaires d'ouverture par jour */}
                    {activeTab === 'hours' && (
                        <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm max-w-sm mx-auto">
                            {!place.openingHours || place.openingHours.length === 0 ? (
                                <div className="text-center py-6 text-gray-400">
                                    <p className="text-sm">Aucun horaire d'ouverture disponible.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {place.openingHours.map((line, i) => {
                                        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                                        const todayIndex = new Date().getDay();
                                        const isToday = line.startsWith(days[todayIndex]);
                                        
                                        return (
                                            <div 
                                                key={i} 
                                                className={`flex justify-between items-center py-1.5 px-2.5 rounded-xl text-xs font-bold ${
                                                    isToday 
                                                        ? 'bg-blue-50/80 text-blue-700 border border-blue-150/30 shadow-sm' 
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

            {/* Modal Image Plein Écran (Style Galerie photos immersive) */}
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
