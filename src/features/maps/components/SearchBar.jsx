import { useState, useMemo } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { usePlaceSearch } from '../hooks/usePlaceSearch';
import { useDateStore } from '../../planning/store/useDateStore';

export default function SearchBar({ onPlaceSelected, onSearchRequested, onClearSearch }) {
    const { handleLoad, handlePlaceChanged } = usePlaceSearch(onPlaceSelected);
    const favorites = useDateStore((state) => state.favorites || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFavSuggestions, setShowFavSuggestions] = useState(false);
    const [ignoredFavs, setIgnoredFavs] = useState([]);

    // NOUVEAU : États pour les filtres
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        minRating: 0,
        minReviews: 0,
        minPrice: 0,
        maxPrice: 4
    });

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
        if (searchTerm.trim()) {
            onSearchRequested(searchTerm, filters);
            setShowFavSuggestions(false);
            setShowFilters(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-11/12 max-w-md">
            <div className="relative flex flex-col gap-1 w-full">
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
                    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 mt-1 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Note Minimum */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[11px] font-black uppercase text-gray-500 tracking-wider">Note minimum</label>
                                <span className="text-sm font-bold text-yellow-600">{filters.minRating} ⭐</span>
                            </div>
                            <input 
                                type="range" min="0" max="5" step="0.5" 
                                value={filters.minRating}
                                onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                            />
                        </div>

                        {/* Avis Minimum */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[11px] font-black uppercase text-gray-500 tracking-wider">Avis minimum</label>
                                <span className="text-sm font-bold text-blue-600">{filters.minReviews}+</span>
                            </div>
                            <select 
                                value={filters.minReviews}
                                onChange={(e) => setFilters({...filters, minReviews: parseInt(e.target.value)})}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
                            >
                                <option value="0">Tous les avis</option>
                                <option value="100">Plus de 100 avis</option>
                                <option value="500">Plus de 500 avis</option>
                                <option value="1000">Plus de 1000 avis</option>
                            </select>
                        </div>

                        {/* Prix */}
                        <div>
                            <label className="text-[11px] font-black uppercase text-gray-500 tracking-wider mb-2 block">Fourchette de prix</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => {
                                            const newMax = filters.maxPrice === p ? 4 : p;
                                            setFilters({...filters, maxPrice: newMax});
                                        }}
                                        className={`flex-1 py-2 rounded-lg text-sm font-black transition-all border ${
                                            p <= filters.maxPrice 
                                            ? 'bg-green-500 text-white border-green-600 shadow-sm' 
                                            : 'bg-gray-50 text-gray-400 border-gray-200'
                                        }`}
                                    >
                                        {"€".repeat(p)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={handleSearchClick}
                            className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-black transition-colors shadow-lg mt-2"
                        >
                            Appliquer les filtres
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}