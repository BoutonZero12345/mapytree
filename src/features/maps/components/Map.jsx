import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import SearchBar from './SearchBar';
import RouteRenderer from './RouteRenderer';
import { useRouteLogic } from '../hooks/useRouteLogic';
import { useDateStore } from '../../planning/store/useDateStore';
import { getCachedPlace, saveCachedPlace, incrementPlaceClickCount } from '../../../services/db';

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 48.8566, lng: 2.3522 };
const libraries = ['places', 'geometry'];

export default function Map() {
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [searchResults, setSearchResults] = useState([]); // NOUVEAU : Résultats de recherche multiple
    const mapRef = useRef(null);

    const blocks = useDateStore((state) => state.blocks);
    const activeScenarioId = useDateStore((state) => state.activeScenarioId);
    const addBlock = useDateStore((state) => state.addBlock);
    const favorites = useDateStore((state) => state.favorites || []);
    const categories = useDateStore((state) => state.categories || []);
    const toggleFavorite = useDateStore((state) => state.toggleFavorite);
    const loadFavorites = useDateStore((state) => state.loadFavorites);
    const setActivePlaceDetails = useDateStore((state) => state.setActivePlaceDetails);
    const selectedDays = useDateStore((state) => state.selectedDays || []);

    const activeBlocks = blocks.filter(b => b.scenarioId === activeScenarioId);

    const { cachedSegments } = useRouteLogic(activeBlocks);

    useEffect(() => {
        loadFavorites?.();
    }, [loadFavorites]);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: libraries,
        language: 'fr',
        region: 'FR'
    });

    const onMapLoad = useCallback((map) => { mapRef.current = map; }, []);

    const handleMapClick = useCallback((e) => {
        if (!mapRef.current) return;

        if (e.placeId) {
            e.stop(); // Empêche l'info-bulle native
            
            const loadDetails = async () => {
                const cachedData = await getCachedPlace(e.placeId);
                if (cachedData) {
                    setSelectedPlace(cachedData);
                    setMapCenter({ lat: cachedData.lat, lng: cachedData.lng });
                    setActivePlaceDetails(cachedData); // Rempli le volet latéral
                    if (activeScenarioId !== 'plan_a') {
                        addBlock(cachedData);
                    }
                    return;
                }

                const service = new window.google.maps.places.PlacesService(mapRef.current);
                service.getDetails({
                    placeId: e.placeId,
                    fields: ['name', 'formatted_address', 'geometry', 'place_id', 'rating', 'user_ratings_total', 'opening_hours', 'price_level']
                }, async (place, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry?.location) {
                        const newPlace = {
                            name: place.name || 'Lieu sélectionné',
                            address: place.formatted_address || '',
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng(),
                            placeId: place.place_id,
                            rating: place.rating,
                            userRatingsTotal: place.user_ratings_total,
                            imageUrl: null,
                            priceLevel: place.price_level || null,
                            openingHours: place.opening_hours?.weekday_text || null,
                            reviews: null,
                            photos: null
                        };
                        
                        const clickCount = await incrementPlaceClickCount(place.place_id);
                        const isFavorite = favorites.some(f => f.placeId === place.place_id);
                        if (clickCount >= 3 || isFavorite) {
                            await saveCachedPlace(place.place_id, newPlace);
                        }
                        
                        setSelectedPlace(newPlace);
                        setMapCenter({ lat: newPlace.lat, lng: newPlace.lng });
                        setActivePlaceDetails(newPlace); // Rempli le volet latéral
                        if (activeScenarioId !== 'plan_a') {
                            addBlock(newPlace);
                        }
                    }
                });
            };

            loadDetails();
        } else {
            // Clic sur une zone vide (Reverse Geocoding)
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: e.latLng }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const newPlace = {
                        name: results[0].address_components[0]?.long_name || 'Point sur la carte',
                        address: results[0].formatted_address,
                        lat: e.latLng.lat(),
                        lng: e.latLng.lng(),
                        placeId: results[0].place_id
                    };
                    setSelectedPlace(newPlace);
                    setMapCenter({ lat: newPlace.lat, lng: newPlace.lng });
                    if (activeScenarioId !== 'plan_a') {
                        addBlock(newPlace);
                    }
                }
            });
        }
    }, [setActivePlaceDetails, favorites, activeScenarioId, addBlock]);

    const handlePlaceSelected = async (place) => {
        const newLocation = { lat: place.lat, lng: place.lng };
        setSearchResults([]); // Nettoyage recherche large
        
        if (place.placeId) {
            const cachedData = await getCachedPlace(place.placeId);
            if (cachedData) {
                setSelectedPlace(cachedData);
                setActivePlaceDetails(cachedData); // Rempli le volet latéral
                if (activeScenarioId !== 'plan_a') {
                    addBlock(cachedData);
                }
            } else if (mapRef.current) {
                const service = new window.google.maps.places.PlacesService(mapRef.current);
                service.getDetails({
                    placeId: place.placeId,
                    fields: ['name', 'formatted_address', 'geometry', 'place_id', 'rating', 'user_ratings_total', 'opening_hours', 'price_level']
                }, async (details, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && details) {
                        const richPlace = {
                            name: details.name || place.name,
                            address: details.formatted_address || place.address,
                            lat: details.geometry?.location?.lat() || place.lat,
                            lng: details.geometry?.location?.lng() || place.lng,
                            placeId: details.place_id,
                            rating: details.rating,
                            userRatingsTotal: details.user_ratings_total,
                            imageUrl: null,
                            priceLevel: details.price_level || null,
                            openingHours: details.opening_hours?.weekday_text || null,
                            reviews: null,
                            photos: null
                        };
                        
                        const clickCount = await incrementPlaceClickCount(details.place_id);
                        const isFavorite = favorites.some(f => f.placeId === details.place_id);
                        if (clickCount >= 3 || isFavorite) {
                            await saveCachedPlace(details.place_id, richPlace);
                        }
                        
                        setSelectedPlace(richPlace);
                        setActivePlaceDetails(richPlace); // Rempli le volet latéral
                        if (activeScenarioId !== 'plan_a') {
                            addBlock(richPlace);
                        }
                    } else {
                        setSelectedPlace(place);
                        setActivePlaceDetails(place); // Rempli le volet latéral
                        if (activeScenarioId !== 'plan_a') {
                            addBlock(place);
                        }
                    }
                });
            } else {
                setSelectedPlace(place);
                setActivePlaceDetails(place); // Rempli le volet latéral
                if (activeScenarioId !== 'plan_a') {
                    addBlock(place);
                }
            }
        } else {
            setSelectedPlace(place);
            setActivePlaceDetails(place); // Rempli le volet latéral
            if (activeScenarioId !== 'plan_a') {
                addBlock(place);
            }
        }

        setMapCenter(newLocation);
        if (mapRef.current) {
            mapRef.current.setZoom(15);
            mapRef.current.panTo(newLocation);
        }
    };

    const handleBroadSearch = useCallback((query, filterParams = {}) => {
        if (!mapRef.current) return;

        const service = new window.google.maps.places.PlacesService(mapRef.current);
        
        let enrichedQuery = query.trim();
        let placeType = undefined;
        
        if (filterParams.category === 'lodging') {
            placeType = 'lodging';
            if (!enrichedQuery) enrichedQuery = "hôtel";
            if (filterParams.subType === '3_stars') enrichedQuery += " 3 étoiles";
            else if (filterParams.subType === '4_stars') enrichedQuery += " 4 étoiles";
            else if (filterParams.subType === '5_stars') enrichedQuery += " 5 étoiles";
        } else if (filterParams.category === 'restaurant') {
            placeType = 'restaurant';
            if (!enrichedQuery) enrichedQuery = "restaurant";
            if (filterParams.subType === 'italien') enrichedQuery += " italien";
            else if (filterParams.subType === 'japonais') enrichedQuery += " japonais";
            else if (filterParams.subType === 'fast_food') enrichedQuery += " burger fast-food";
            else if (filterParams.subType === 'francais') enrichedQuery += " français";
            else if (filterParams.subType === 'asiatique') enrichedQuery += " asiatique";
        } else if (filterParams.category === 'museum') {
            placeType = 'tourist_attraction';
            if (!enrichedQuery) enrichedQuery = "musée attraction";
            else enrichedQuery += " musée attraction";
        } else if (filterParams.category === 'transit_station') {
            placeType = 'transit_station';
            if (!enrichedQuery) enrichedQuery = "gare station métro";
            else enrichedQuery += " gare station métro";
        }
        
        if (!enrichedQuery) return; // Si toujours vide, ne rien faire

        const request = {
            query: enrichedQuery,
            bounds: mapRef.current.getBounds(),
            minPrice: filterParams.minPrice ?? 0,
            maxPrice: filterParams.maxPrice ?? 4,
            type: placeType
        };

        service.textSearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                // FILTRAGE CLIENT (Rating et Avis)
                const filtered = results.filter(res => 
                    (res.rating || 0) >= (filterParams.minRating || 0) &&
                    (res.user_ratings_total || 0) >= (filterParams.minReviews || 0)
                );

                // LIMITE DE RÉSULTATS (maxResults)
                const maxResults = filterParams.maxResults || 25;
                const sliced = filtered.slice(0, maxResults);

                const formattedResults = sliced.map(res => ({
                    id: res.place_id,
                    placeId: res.place_id,
                    name: res.name,
                    address: res.formatted_address,
                    lat: res.geometry.location.lat(),
                    lng: res.geometry.location.lng(),
                    rating: res.rating,
                    userRatingsTotal: res.user_ratings_total
                }));
                setSearchResults(formattedResults);
                
                if (formattedResults.length > 0) {
                    const bounds = new window.google.maps.LatLngBounds();
                    formattedResults.forEach(res => bounds.extend({ lat: res.lat, lng: res.lng }));
                    mapRef.current.fitBounds(bounds);
                }
            }
        });
    }, []);

    if (!isLoaded) return <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">Chargement de la carte...</div>;

    const favorite = selectedPlace && favorites.find(f => (f.placeId && f.placeId === selectedPlace.placeId) || (f.lat === selectedPlace.lat && f.lng === selectedPlace.lng));
    const isFavorite = !!favorite;
    const favoriteCategory = favorite && categories.find(c => c.id === favorite.categoryId);

    return (
        <div className="relative w-full h-full">
            <SearchBar 
                onPlaceSelected={handlePlaceSelected} 
                onSearchRequested={handleBroadSearch}
                onClearSearch={() => setSearchResults([])}
            />

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={12}
                onLoad={onMapLoad}
                onClick={handleMapClick}
                options={{ disableDefaultUI: true, zoomControl: true }}
            >
                {/* Marqueurs du planning avec click handler rich details */}
                {activeBlocks.map((block) => (
                    <MarkerF 
                        key={block.id} 
                        position={{ lat: block.lat, lng: block.lng }}
                        onClick={async () => {
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
                        }}
                    />
                ))}

                {/* NOUVEAU : Marqueurs de résultats de recherche (Orange) */}
                {searchResults.map((res) => (
                    <MarkerF 
                        key={res.id} 
                        position={{ lat: res.lat, lng: res.lng }}
                        icon="http://maps.google.com/mapfiles/ms/icons/orange-dot.png"
                        onClick={async () => {
                            if (res.placeId) {
                                const cached = await getCachedPlace(res.placeId);
                                if (cached) {
                                    setSelectedPlace(cached);
                                    setActivePlaceDetails(cached);
                                } else if (mapRef.current) {
                                    const service = new window.google.maps.places.PlacesService(mapRef.current);
                                    service.getDetails({
                                        placeId: res.placeId,
                                        fields: ['name', 'formatted_address', 'geometry', 'place_id', 'rating', 'user_ratings_total', 'opening_hours', 'price_level']
                                    }, async (details, status) => {
                                        if (status === window.google.maps.places.PlacesServiceStatus.OK && details) {
                                            const richPlace = {
                                                name: details.name || res.name,
                                                address: details.formatted_address || res.address,
                                                lat: details.geometry?.location?.lat() || res.lat,
                                                lng: details.geometry?.location?.lng() || res.lng,
                                                placeId: details.place_id,
                                                rating: details.rating,
                                                userRatingsTotal: details.user_ratings_total,
                                                imageUrl: null,
                                                priceLevel: details.price_level || null,
                                                openingHours: details.opening_hours?.weekday_text || null,
                                                reviews: null,
                                                photos: null
                                            };
                                            const clickCount = await incrementPlaceClickCount(details.place_id);
                                            const isFavorite = favorites.some(f => f.placeId === details.place_id);
                                            if (clickCount >= 3 || isFavorite) {
                                                await saveCachedPlace(details.place_id, richPlace);
                                            }
                                            setSelectedPlace(richPlace);
                                            setActivePlaceDetails(richPlace);
                                        }
                                    });
                                }
                            } else {
                                setSelectedPlace(res);
                            }
                        }}
                    />
                ))}

                <RouteRenderer segments={cachedSegments} />

                {selectedPlace && (
                    <>
                        <MarkerF position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }} animation={window.google.maps.Animation.DROP} />
                        <InfoWindowF position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }} onCloseClick={() => setSelectedPlace(null)}>
                            <div className="p-2 text-black flex flex-col gap-2 min-w-[220px]">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-bold text-lg leading-tight truncate">{selectedPlace.name}</p>
                                        
                                        {/* NOUVEAU : Affichage de la note */}
                                        {selectedPlace.rating && (
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className="flex items-center text-yellow-500">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                                    <span className="text-xs font-black ml-0.5">{selectedPlace.rating}</span>
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-medium">({selectedPlace.userRatingsTotal?.toLocaleString()} avis)</span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => toggleFavorite(selectedPlace)}
                                        className={`shrink-0 p-1 rounded-full transition-colors`}
                                        style={{ color: isFavorite ? (favoriteCategory?.color || '#eab308') : '#d1d5db' }}
                                        title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                                    >
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    </button>
                                </div>
                                
                                <p className="text-xs text-gray-500 line-clamp-2">{selectedPlace.address}</p>

                                {/* NOUVEAU : Affichage des horaires des jours concernés ou d'aujourd'hui */}
                                {selectedPlace.openingHours && selectedPlace.openingHours.length > 0 && (
                                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2 mt-1.5 flex flex-col gap-1 shadow-inner select-none">
                                        {(() => {
                                            const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                                            const targets = selectedDays.length > 0 ? selectedDays : [days[new Date().getDay()]];
                                            const matchedLines = selectedPlace.openingHours.filter(line => 
                                                targets.some(day => line.toLowerCase().startsWith(day.toLowerCase()))
                                            );
                                            
                                            if (matchedLines.length === 0) return <span className="text-[9px] text-gray-400 font-extrabold italic">Horaires non disponibles</span>;
                                            
                                            return matchedLines.map((line, idx) => {
                                                const parts = line.split(':');
                                                const dayPart = parts[0];
                                                const hoursPart = parts.slice(1).join(':').trim();
                                                
                                                return (
                                                    <div key={idx} className="flex justify-between items-center text-[9px] font-bold text-gray-650">
                                                        <span className="flex items-center gap-1 text-gray-600">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-xs"></span>
                                                            {dayPart}
                                                        </span>
                                                        <span className="text-blue-700 bg-blue-50 px-1 py-0.2 rounded font-extrabold border border-blue-100/50">{hoursPart}</span>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                )}
                                
                                <button
                                    onClick={() => { addBlock(selectedPlace); setSelectedPlace(null); setSearchResults([]); }}
                                    className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 mt-1 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    Ajouter au planning
                                </button>
                            </div>
                        </InfoWindowF>
                    </>
                )}
            </GoogleMap>
        </div>
    );
}