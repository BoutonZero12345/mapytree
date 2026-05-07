import { Autocomplete } from '@react-google-maps/api';
import { usePlaceSearch } from '../hooks/usePlaceSearch';

export default function SearchBar({ onPlaceSelected }) {
    // On récupère notre logique déportée
    const { handleLoad, handlePlaceChanged } = usePlaceSearch(onPlaceSelected);

    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-11/12 max-w-md">
            <div className="relative flex items-center bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">

                {/* Icône de recherche (Loupe) */}
                <div className="pl-4 pr-2 text-gray-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>

                {/* Le composant Google Maps Autocomplete */}
                <div className="flex-1">
                    <Autocomplete
                        onLoad={handleLoad}
                        onPlaceChanged={handlePlaceChanged}
                        // Optimisation API : on demande uniquement ce dont on a besoin
                        fields={['name', 'formatted_address', 'geometry']}
                    >
                        <input
                            type="text"
                            placeholder="Rechercher un lieu, un resto, un musée..."
                            className="w-full py-3 pr-4 border-0 focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400 bg-transparent"
                        />
                    </Autocomplete>
                </div>

            </div>
        </div>
    );
}