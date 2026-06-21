import { useState, useMemo, useEffect, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { usePlaceSearch } from '../hooks/usePlaceSearch';
import { useDateStore } from '../../planning/store/useDateStore';

export default function SearchBar({ onPlaceSelected, onSearchRequested, onClearSearch }) {
    const { handleLoad, handlePlaceChanged } = usePlaceSearch(onPlaceSelected);
    const favorites = useDateStore((state) => state.favorites || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFavSuggestions, setShowFavSuggestions] = useState(false);
    const [ignoredFavs, setIgnoredFavs] = useState([]);
    const filterRef = useRef(null);

    // États pour les filtres
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        minRating: 0,
        minReviews: 0,
        minPrice: 0,
        maxPrice: 4,
        category: 'all',
        subType: 'all',
        maxResults: 25
    });

    // Fermeture simple au clic à l'extérieur (sans déclenchement automatique de recherche)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                if (showFilters) {
                    setShowFilters(false);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showFilters]);

    const handleCloseFilters = () => {
        setShowFilters(false);
    };

    const filteredFavorites = useMemo(() => {
        if (searchTerm.length < 2) return [];
        return favorites.filter(fav =>
            !ignoredFavs.includes(fav.id) &&
            fav.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, favorites, ignoredFavs]);

    const handleSelectFavorite = (fav) => {
        onPlaceSelected(fav);
        setSearchTerm('');
        setShowFavSuggestions(false);
    };

    const handleIgnoreFavorite = (e, favId) => {
        e.stopPropagation();
        setIgnoredFavs(prev => [...prev, favId]);
    };

    const handleSearchClick = () => {
        onSearchRequested(searchTerm, filters);
        setShowFavSuggestions(false);
        setShowFilters(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    const handlePriceSelect = (level) => {
        setFilters(prev => ({
            ...prev,
            minPrice: 0,
            maxPrice: level
        }));
    };

    const handleCategorySelect = (catId) => {
        setFilters(prev => ({
            ...prev,
            category: catId,
            subType: 'all' // Réinitialise le sous-type lors du changement de catégorie
        }));
    };

    const handleSubTypeSelect = (subId) => {
        setFilters(prev => ({
            ...prev,
            subType: subId
        }));
    };

    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-11/12 max-w-md">
            <div className="relative flex flex-col gap-1 w-full" ref={filterRef}>
                {/* Suggestions de favoris */}
                {filteredFavorites.length > 0 && showFavSuggestions && (
                    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden mb-1">
                        {filteredFavorites.map(fav => (
                            <div
                                key={fav.id}
                                onClick={() => handleSelectFavorite(fav)}
                                className="flex items-center justify-between px-4 py-3 hover:bg-yellow-50 cursor-pointer transition-colors group"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <span className="text-yellow-500 shrink-0">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    </span>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-sm text-gray-800 truncate">{fav.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{fav.address}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleIgnoreFavorite(e, fav.id)}
                                    className="p-1 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Masquer cette suggestion"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="relative flex items-center bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                    {/* Bouton de recherche (Loupe) */}
                    <button 
                        onClick={handleSearchClick}
                        className="pl-4 pr-2 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Recherche large"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>

                    {/* Le composant Google Maps Autocomplete */}
                    <div className="flex-1">
                        <Autocomplete
                            onLoad={handleLoad}
                            onPlaceChanged={handlePlaceChanged}
                            fields={['name', 'formatted_address', 'geometry', 'place_id']}
                        >
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowFavSuggestions(true);
                                }}
                                onFocus={() => setShowFavSuggestions(true)}
                                onKeyDown={handleKeyDown}
                                placeholder="Rechercher un lieu, un resto, un musée..."
                                className="w-full py-3 pr-2 border-0 focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400 bg-transparent"
                            />
                        </Autocomplete>
                    </div>

                    {/* Bouton Filtres */}
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 mr-1 rounded-md transition-colors ${showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
                        title="Filtres avancés"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="2" y1="14" x2="6" y2="14"></line><line x1="10" y1="8" x2="14" y2="8"></line><line x1="18" y1="16" x2="22" y2="16"></line></svg>
                    </button>

                    {/* Bouton de nettoyage */}
                    {searchTerm && (
                        <button 
                            onClick={() => {
                                    setSearchTerm('');
                                    onClearSearch();
                                }}
                            className="pr-4 pl-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Effacer la recherche"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}
                </div>

                {/* PANNEAU DE FILTRES */}
                {showFilters && (
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/80 p-4 mt-1.5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-3 duration-250 z-30 max-h-[70vh] overflow-y-auto no-scrollbar">
                        
                        {/* En-tête */}
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                            <div className="flex items-center gap-1.5 text-gray-800">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="2" y1="14" x2="6" y2="14"></line><line x1="10" y1="8" x2="14" y2="8"></line><line x1="18" y1="16" x2="22" y2="16"></line></svg>
                                <h3 className="text-xs font-black uppercase tracking-wider">Recherche avancée</h3>
                            </div>
                            <button 
                                onClick={handleCloseFilters}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all border border-transparent hover:border-red-100 shadow-sm"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* 1. Catégories Majeures */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Catégorie de lieu</label>
                            <div className="grid grid-cols-5 gap-1">
                                {[
                                    { id: 'all', label: 'Tout', svg: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> },
                                    { id: 'lodging', label: 'Hôtels', svg: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><circle cx="6" cy="12" r="2"></circle></svg> },
                                    { id: 'restaurant', label: 'Restos', svg: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v8c0 1.1.9 2 2 2h3Z"></path><path d="M18 22V17"></path></svg> },
                                    { id: 'museum', label: 'Loisirs', svg: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21h18"></path><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3"></path><path d="M5 21V10.85"></path><path d="M19 21V10.85"></path><path d="M9 21V14h6v7"></path></svg> },
                                    { id: 'transit_station', label: 'Gares', svg: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="4" y="3" width="16" height="16" rx="2"></rect><path d="M4 11h16"></path><path d="M12 3v8"></path><path d="m8 19-2 3"></path><path d="m16 19 2 3"></path><circle cx="8" cy="15" r="1"></circle><circle cx="16" cy="15" r="1"></circle></svg> }
                                ].map(cat => {
                                    const isActive = filters.category === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => handleCategorySelect(cat.id)}
                                            className={`py-2 px-1 rounded-xl text-[10px] font-extrabold flex flex-col items-center gap-1.5 border transition-all ${
                                                isActive
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100 scale-102 font-black'
                                                    : 'bg-gray-50 border-gray-150 text-gray-550 hover:bg-gray-100 hover:text-gray-700'
                                            }`}
                                        >
                                            <span className={isActive ? 'text-white' : 'text-gray-400'}>{cat.svg}</span>
                                            <span className="truncate max-w-full text-[9px]">{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Sous-types contextuels */}
                        {filters.category === 'lodging' && (
                            <div className="flex flex-col gap-1.5 p-2 bg-blue-50/40 border border-blue-100/50 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
                                <label className="text-[9px] font-black uppercase text-blue-500 tracking-wider">Étoiles de l'Hôtel</label>
                                <div className="flex gap-1.5">
                                    {[
                                        { id: 'all', label: 'Toutes' },
                                        { id: '3_stars', label: '3 étoiles' },
                                        { id: '4_stars', label: '4 étoiles' },
                                        { id: '5_stars', label: '5 étoiles' }
                                    ].map(sub => {
                                        const isActive = filters.subType === sub.id;
                                        return (
                                            <button
                                                key={sub.id}
                                                type="button"
                                                onClick={() => handleSubTypeSelect(sub.id)}
                                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                                    isActive
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm font-black'
                                                        : 'bg-white border-blue-100 text-blue-700 hover:bg-blue-50'
                                                }`}
                                            >
                                                {sub.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {filters.category === 'restaurant' && (
                            <div className="flex flex-col gap-1.5 p-2 bg-blue-50/40 border border-blue-100/50 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
                                <label className="text-[9px] font-black uppercase text-blue-500 tracking-wider">Spécialité de Cuisine</label>
                                <div className="grid grid-cols-3 gap-1">
                                    {[
                                        { id: 'all', label: 'Toutes cuisines' },
                                        { id: 'italien', label: '🍕 Italien' },
                                        { id: 'japonais', label: '🍣 Japonais' },
                                        { id: 'fast_food', label: '🍔 Burgers' },
                                        { id: 'francais', label: '🥐 Français' },
                                        { id: 'asiatique', label: '🥢 Asiatique' }
                                    ].map(sub => {
                                        const isActive = filters.subType === sub.id;
                                        return (
                                            <button
                                                key={sub.id}
                                                type="button"
                                                onClick={() => handleSubTypeSelect(sub.id)}
                                                className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                                    isActive
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm font-black'
                                                        : 'bg-white border-blue-100 text-blue-700 hover:bg-blue-50'
                                                }`}
                                            >
                                                {sub.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 3. Note Minimum */}
                        <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-2.5">
                            <div className="flex justify-between items-center mb-1.5">
                                <div className="flex items-center gap-1">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#eab308" stroke="#eab308" className="shrink-0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Note minimum</label>
                                </div>
                                <span className="text-[10px] font-black text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">{filters.minRating.toFixed(1)} / 5.0</span>
                            </div>
                            <input 
                                type="range" min="0" max="5" step="0.1" 
                                value={filters.minRating}
                                onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                                className="w-full h-1.5 bg-gray-250/60 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                            />
                        </div>

                        {/* 4. Volume d'avis */}
                        <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-2.5">
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Volume d'avis</label>
                                <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{filters.minReviews.toLocaleString()}+ avis</span>
                            </div>
                            <select 
                                value={filters.minReviews}
                                onChange={(e) => setFilters({...filters, minReviews: parseInt(e.target.value)})}
                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-xs"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%233b82f6\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '0.85rem' }}
                            >
                                <option value="0">Tous les volumes d'avis</option>
                                <option value="100">100+ avis</option>
                                <option value="500">500+ avis</option>
                                <option value="1000">1 000+ avis</option>
                                <option value="2000">2 000+ avis</option>
                                <option value="5000">5 000+ avis</option>
                            </select>
                        </div>

                        {/* 5. Budget Maximum */}
                        <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-2.5 flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Budget maximum</label>
                                <span className="text-[10px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                    {filters.maxPrice === 4 ? 'Tous budgets' : '€'.repeat(filters.maxPrice)}
                                </span>
                            </div>
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4].map(level => {
                                    const label = '€'.repeat(level);
                                    const isActive = filters.maxPrice === level;
                                    return (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => handlePriceSelect(level)}
                                            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border ${
                                                isActive
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-150'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 6. Nombre max de résultats */}
                        <div className="bg-gray-50/50 border border-gray-150 rounded-xl p-2.5">
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Résultats maximum</label>
                                <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">{filters.maxResults} marqueurs</span>
                            </div>
                            <input 
                                type="range" min="10" max="100" step="5" 
                                value={filters.maxResults}
                                onChange={(e) => setFilters({...filters, maxResults: parseInt(e.target.value)})}
                                className="w-full h-1.5 bg-gray-250/60 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                        </div>

                        {/* 7. Grand bouton de validation explicite */}
                        <button
                            type="button"
                            onClick={handleSearchClick}
                            className="bg-blue-600 text-white py-3 px-4 rounded-xl text-xs font-black hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 mt-1 cursor-pointer"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            Appliquer et Rechercher
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}