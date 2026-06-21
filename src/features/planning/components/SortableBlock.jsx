import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDateStore } from '../store/useDateStore';
import TransportSelector from './TransportSelector';
import { getCachedPlace } from '../../../services/db';

const hslToHex = (h, s, l) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};

export default function SortableBlock({ block, index, travelInfo, scheduledStartTime, isLast, nextBlockId, nextBlockMode, nextBlockRouteIndex }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

    const updateBlockDetails = useDateStore((state) => state.updateBlockDetails);
    const updateBlockColor = useDateStore((state) => state.updateBlockColor);
    const splitAtBlock = useDateStore((state) => state.splitAtBlock);
    const deleteBlock = useDateStore((state) => state.deleteBlock);
    const favorites = useDateStore((state) => state.favorites);
    const categories = useDateStore((state) => state.categories);
    const toggleFavorite = useDateStore((state) => state.toggleFavorite);
    const setActivePlaceDetails = useDateStore((state) => state.setActivePlaceDetails); // NOUVEAU
    const selectedDays = useDateStore((state) => state.selectedDays || []);

    const [isExpanded, setIsExpanded] = useState(false);
    const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
    const [currentHue, setCurrentHue] = useState(200);
    const [currentLightness, setCurrentLightness] = useState(50);

    const isFavorite = favorites.some(f => (f.placeId && f.placeId === block.placeId) || (f.lat === block.lat && f.lng === block.lng));

    const PRESET_COLORS = ['#0ea5e9', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#94a3b8'];

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
        position: 'relative',
        borderLeftWidth: '4px',
        borderLeftColor: block.color || (block.type === 'EVENT' ? '#94a3b8' : '#0ea5e9')
    };

    const handleSplit = (e) => {
        e.stopPropagation();
        const confirmMsg = `Créer un nouveau plan à partir d'ici ?\n(Cela copiera tous les éléments PRÉCÉDENTS dans un nouveau scénario nommé "Plan sans ${block.name}")`;
        if (window.confirm(confirmMsg)) {
            splitAtBlock(block.id);
        }
    };

    // NOUVEAU : Vérification intelligente des horaires d'ouverture
    const checkOpeningHours = (openingHours, scheduledTimeStr) => {
        if (!openingHours || !scheduledTimeStr) return null;
        
        const daysFr = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const todayFr = daysFr[new Date().getDay()];
        
        const todayLine = openingHours.find(line => line.startsWith(todayFr));
        if (!todayLine) return null;
        
        if (todayLine.includes('Fermé') || todayLine.includes('Closed')) {
            return { status: 'CLOSED', message: `Fermé le ${todayFr}` };
        }
        
        if (todayLine.includes('24h') || todayLine.includes('24 hours')) {
            return { status: 'OPEN', message: `Ouvert 24h/24` };
        }
        
        const timeMatch = todayLine.match(/(\d{2}):(\d{2})\s*[–-]\s*(\d{2}):(\d{2})/);
        if (!timeMatch) return null;
        
        const [_, startH, startM, endH, endM] = timeMatch.map(Number);
        const [schH, schM] = scheduledTimeStr.split(':').map(Number);
        
        const startMin = startH * 60 + startM;
        const endMin = endH * 60 + endM;
        const schMin = schH * 60 + schM;
        
        let isOpen = false;
        if (endMin < startMin) {
            isOpen = (schMin >= startMin || schMin <= endMin);
        } else {
            isOpen = (schMin >= startMin && schMin <= endMin);
        }
        
        if (isOpen) {
            const minsRemaining = endMin < startMin ? (schMin >= startMin ? (1440 - schMin + endMin) : (endMin - schMin)) : (endMin - schMin);
            if (minsRemaining > 0 && minsRemaining <= 30) {
                return { status: 'CLOSING_SOON', message: `Ferme bientôt (${minsRemaining} min)` };
            }
            return { status: 'OPEN', message: `Ouvert à ${scheduledTimeStr}` };
        } else {
            return { status: 'CLOSED', message: `Fermé à ${scheduledTimeStr}` };
        }
    };

    // NOUVEAU : Alerte si fermé un des jours du planning
    const checkSelectedDaysStatus = (openingHours, selectedDays) => {
        if (!openingHours || !selectedDays || selectedDays.length === 0) return null;
        for (const day of selectedDays) {
            const line = openingHours.find(l => l.startsWith(day));
            if (line) {
                if (line.includes('Fermé') || line.includes('Closed')) {
                    return { day, status: 'CLOSED', message: `Fermé le ${day}` };
                }
            }
        }
        return null;
    };

    const hoursStatus = checkOpeningHours(block.openingHours, scheduledStartTime);
    const closedDayAlert = checkSelectedDaysStatus(block.openingHours, selectedDays);

    // Ouvre la modal Google Place enrichie
    const handleShowGoogleDetails = async (e) => {
        e.stopPropagation();
        if (!block.placeId) return;
        const cached = await getCachedPlace(block.placeId);
        if (cached) {
            setActivePlaceDetails(cached);
        } else {
            setActivePlaceDetails({
                name: block.name,
                address: block.address,
                placeId: block.placeId,
                rating: block.rating,
                userRatingsTotal: block.userRatingsTotal,
                imageUrl: block.imageUrl,
                priceLevel: block.priceLevel,
                openingHours: block.openingHours,
                reviews: block.reviews,
                photos: block.imageUrl ? [block.imageUrl] : null
            });
        }
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div className={`bg-white border ${isDragging ? 'border-blue-500 shadow-xl' : (block.type === 'EVENT' ? 'border-dashed border-gray-300' : 'border-gray-200')} rounded-xl p-3 md:p-4 shadow-sm flex flex-col gap-2 transition-all`}>

                {/* En-tête (Titre, adresse, actions) */}
                <div className="flex items-center gap-3">

                    {/* Poignée de Drag & Drop */}
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 p-1 touch-none">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                    </div>

                    {/* Miniature Photo Google ou Index */}
                    {block.type !== 'EVENT' && block.imageUrl ? (
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                            <img src={block.imageUrl} alt={block.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className={`${block.type === 'EVENT' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'} font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0`}>
                            {block.type === 'EVENT' ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            ) : (
                                index + 1
                            )}
                        </div>
                    )}

                    {/* Textes (Cliquables pour ouvrir/fermer) */}
                    <div
                        className="flex-1 overflow-hidden cursor-pointer group flex flex-col justify-center"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-bold text-sm md:text-base truncate group-hover:text-blue-600 transition-colors ${block.type === 'EVENT' ? 'text-gray-500 italic' : 'text-gray-800'}`}>
                                {block.name}
                            </h3>
                            {block.type !== 'EVENT' && isFavorite && (
                                <span className="text-yellow-500 shrink-0">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                </span>
                            )}
                            
                            {/* Pastille de niveau de prix si disponible */}
                            {block.priceLevel && (
                                <span className="text-[10px] font-black text-green-700 bg-green-50 px-1 py-0.2 rounded border border-green-150/30">
                                    {'€'.repeat(block.priceLevel)}
                                </span>
                            )}
                        </div>
                        {block.type !== 'EVENT' && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">{block.address}</p>
                        )}

                        {/* Affichage intelligent du statut d'ouverture sous l'adresse */}
                        {closedDayAlert ? (
                            <div className="mt-1 flex flex-wrap gap-1">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-red-650 text-white animate-pulse border border-red-750 shadow-sm">
                                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                    <span>{closedDayAlert.message}</span>
                                </span>
                            </div>
                        ) : hoursStatus && (
                            <div className="mt-1">
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    hoursStatus.status === 'OPEN' 
                                        ? 'bg-green-50 text-green-700 border border-green-100' 
                                        : hoursStatus.status === 'CLOSING_SOON'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                        : 'bg-red-50 text-red-700 border border-red-100 animate-pulse'
                                }`}>
                                    {hoursStatus.status === 'OPEN' ? (
                                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 8 12 12 14 14"></polyline></svg>
                                    ) : hoursStatus.status === 'CLOSING_SOON' ? (
                                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                    ) : (
                                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                    )}
                                    <span>{hoursStatus.message}</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-1 shrink-0">
                        {/* Bouton de consultation Google Places Modal */}
                        {block.placeId && (
                            <button
                                onClick={handleShowGoogleDetails}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Voir les photos & avis Google"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            </button>
                        )}

                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                            className={`p-1 rounded-md transition-colors ${isExpanded ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                            title="Modifier les détails"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>

                        <button onClick={handleSplit} className="p-1 text-gray-400 hover:text-amber-600 rounded-md transition-colors" title="Split : Créer un plan alternatif à partir d'ici">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); if (window.confirm("Supprimer ?")) deleteBlock(block.id); }} className="p-1 text-gray-400 hover:text-red-600 rounded-md transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>

                {/* Bannière photo Google si dépliée */}
                {isExpanded && block.type !== 'EVENT' && block.imageUrl && (
                    <div className="w-full h-[100px] rounded-xl overflow-hidden shadow-inner border border-gray-200/50 mt-1 relative cursor-pointer group" onClick={handleShowGoogleDetails}>
                        <img src={block.imageUrl} alt={block.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                            <span className="text-[10px] text-white font-black uppercase tracking-wider bg-slate-900/60 px-2.5 py-1 rounded-full shadow border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">Voir galerie et avis</span>
                        </div>
                    </div>
                )}

                {/* Zone de détails (Modification) */}
                {isExpanded && (
                    <div className="pl-0 md:pl-[2.5rem] flex flex-col gap-3 mt-2 pr-1 animate-in fade-in slide-in-from-top-2 duration-200">
                        
                        {/* Renommer */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Nom de l'activité</span>
                            <input 
                                autoFocus
                                type="text" 
                                value={block.name} 
                                onChange={(e) => updateBlockDetails(block.id, { name: e.target.value })}
                                className="w-full text-sm font-bold bg-gray-50 border-none rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Heure fixée</span>
                                <div className="flex items-center gap-2 bg-gray-50 px-2 py-1.5 rounded-lg">
                                    <svg className="text-gray-400 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    <input 
                                        type="time" 
                                        value={block.fixedStartTime || ''} 
                                        onChange={(e) => updateBlockDetails(block.id, { fixedStartTime: e.target.value || null })}
                                        className="bg-transparent text-sm font-bold outline-none" 
                                    />
                                    {block.fixedStartTime && (
                                        <button 
                                            onClick={() => updateBlockDetails(block.id, { fixedStartTime: null })}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Temps</span>
                                <div className="flex items-center gap-2 bg-gray-50 px-2 py-1.5 rounded-lg">
                                    <svg className="text-gray-400 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 15 15"></polyline></svg>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={block.durationMinutes === 0 ? '' : block.durationMinutes} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const num = val === '' ? 0 : (Number(val) === 0 ? 0 : Math.max(1, Number(val)));
                                            updateBlockDetails(block.id, { durationMinutes: num });
                                        }} 
                                        placeholder="0"
                                        className="bg-transparent w-12 text-sm font-bold outline-none" 
                                    />
                                    <span className="text-[10px] text-gray-500 font-bold uppercase">min</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Budget</span>
                                <div className="flex items-center gap-2 bg-gray-50 px-2 py-1.5 rounded-lg">
                                    <svg className="text-gray-400 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                    <input type="number" value={block.budget || ''} onChange={(e) => updateBlockDetails(block.id, { budget: Number(e.target.value) })} placeholder="0" className="bg-transparent w-12 text-sm font-bold outline-none" />
                                    <span className="text-[10px] text-gray-500 font-bold uppercase">€</span>
                                </div>
                            </div>
                        </div>

                        {/* Choix de sous-catégorie (si favori) */}
                        {isFavorite && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Sous-catégorie</span>
                                <select 
                                    value={block.categoryId || ''} 
                                    onChange={(e) => updateBlockDetails(block.id, { categoryId: e.target.value || null })}
                                    className="w-full text-xs font-bold bg-gray-50 border-none rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="">Aucune catégorie</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Notes</span>
                            <textarea value={block.notes || ''} onChange={(e) => updateBlockDetails(block.id, { notes: e.target.value })} placeholder="Mémos, codes, adresses précises..." className="w-full text-sm bg-gray-50 border-none rounded-lg px-3 py-2 h-16 resize-none outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>

                        {/* Sélecteur de couleur et favoris */}
                        <div className="flex items-center justify-between gap-3 mt-1 flex-wrap">
                            <div className="flex items-center gap-3">
                                <div className="flex flex-wrap gap-1.5">
                                    {PRESET_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => updateBlockColor(block.id, color)}
                                            className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${block.color === color ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                    {/* Sélecteur de couleur custom premium */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowCustomColorPicker(!showCustomColorPicker)}
                                            className="w-5 h-5 rounded-full border border-gray-250 bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 hover:scale-110 transition-transform shadow-sm flex items-center justify-center"
                                            title="Palette de couleurs personnalisée"
                                        >
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>
                                        </button>

                                        {showCustomColorPicker && (
                                            <>
                                                <div className="fixed inset-0 z-30" onClick={() => setShowCustomColorPicker(false)}></div>
                                                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-250 rounded-2xl shadow-xl p-3.5 z-40 min-w-[200px] flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest select-none">Palette & Nuances</span>
                                                    
                                                    {/* Pastilles Harmonieuses */}
                                                    <div className="grid grid-cols-6 gap-1 mb-1">
                                                        {['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4'].map(c => (
                                                            <button
                                                                key={c}
                                                                type="button"
                                                                onClick={() => updateBlockColor(block.id, c)}
                                                                className={`w-4 h-4 rounded-full border transition-transform hover:scale-125 ${block.color === c ? 'border-gray-800 scale-110 shadow-xs' : 'border-transparent'}`}
                                                                style={{ backgroundColor: c }}
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* Preview */}
                                                    <div className="flex items-center gap-2">
                                                        <div 
                                                            className="w-7 h-7 rounded-xl border shadow-sm shrink-0" 
                                                            style={{ backgroundColor: block.color || '#0ea5e9' }}
                                                        />
                                                        <span className="text-[10px] font-mono font-bold text-gray-600 uppercase">{block.color}</span>
                                                    </div>

                                                    {/* Hue Slider */}
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[8px] font-black text-gray-450 uppercase">Teinte</span>
                                                        <input 
                                                            type="range" 
                                                            min="0" 
                                                            max="360" 
                                                            value={currentHue}
                                                            onChange={(e) => {
                                                                const h = Number(e.target.value);
                                                                setCurrentHue(h);
                                                                const hex = hslToHex(h, 95, currentLightness);
                                                                updateBlockColor(block.id, hex);
                                                            }}
                                                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                                            style={{
                                                                background: 'linear-gradient(to right, red 0%, yellow 17%, green 33%, cyan 50%, blue 67%, magenta 83%, red 100%)'
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Lightness Slider */}
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[8px] font-black text-gray-450 uppercase">Luminosité</span>
                                                        <input 
                                                            type="range" 
                                                            min="20" 
                                                            max="80" 
                                                            value={currentLightness}
                                                            onChange={(e) => {
                                                                const l = Number(e.target.value);
                                                                setCurrentLightness(l);
                                                                const hex = hslToHex(currentHue, 95, l);
                                                                updateBlockColor(block.id, hex);
                                                            }}
                                                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-200"
                                                            style={{
                                                                background: `linear-gradient(to right, #000 0%, ${hslToHex(currentHue, 95, 50)} 50%, #fff 100%)`
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {block.type !== 'EVENT' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(block); }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isFavorite ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    {isFavorite ? 'Favori' : 'Mettre en favori'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

            </div>

            {!isLast && (
                <TransportSelector
                    nextBlockId={nextBlockId}
                    nextBlockMode={nextBlockMode}
                    nextBlockRouteIndex={nextBlockRouteIndex}
                    travelInfo={travelInfo}
                />
            )}
        </div>
    );
}