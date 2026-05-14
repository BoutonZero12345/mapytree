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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (searchTerm.trim()) {
                onSearchRequested(searchTerm);
                setShowFavSuggestions(false);
            }
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
                        onClick={() => searchTerm.trim() && onSearchRequested(searchTerm)}
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
                                className="w-full py-3 pr-4 border-0 focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400 bg-transparent"
                            />
                        </Autocomplete>
                    </div>

                    {/* Bouton de nettoyage */}
                    {searchTerm && (
                        <button 
                            onClick={() => {
                                setSearchTerm('');
                                onClearSearch();
                            }}
                            className="pr-4 pl-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Effacer la recherche"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}