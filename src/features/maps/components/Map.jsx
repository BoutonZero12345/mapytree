import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import SearchBar from './SearchBar';
import RouteRenderer from './RouteRenderer';
import { useRouteLogic } from '../hooks/useRouteLogic';
import { useDateStore } from '../../planning/store/useDateStore';

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 48.8566, lng: 2.3522 };
const libraries = ['places', 'geometry'];

export default function Map() {
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const mapRef = useRef(null);

    const blocks = useDateStore((state) => state.blocks);
    const activeScenarioId = useDateStore((state) => state.activeScenarioId);
    const addBlock = useDateStore((state) => state.addBlock);

    const activeBlocks = blocks.filter(b => b.scenarioId === activeScenarioId);

    const { cachedSegments } = useRouteLogic(activeBlocks);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: libraries,
        language: 'fr', // NOUVEAU : Force les instructions en français
        region: 'FR'    // NOUVEAU : Optimise les résultats pour la France
    });

    const onMapLoad = useCallback((map) => { mapRef.current = map; }, []);

    const handleMapClick = useCallback((e) => {
        if (!mapRef.current) return;

        if (e.placeId) {
            e.stop(); // Empêche l'info-bulle native
            const service = new window.google.maps.places.PlacesService(mapRef.current);
            service.getDetails({
                placeId: e.placeId,
                fields: ['name', 'formatted_address', 'geometry']
            }, (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry?.location) {
                    const newPlace = {
                        name: place.name || 'Lieu sélectionné',
                        address: place.formatted_address || '',
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    };
                    setSelectedPlace(newPlace);
                    setMapCenter({ lat: newPlace.lat, lng: newPlace.lng });
                }
            });
        } else {
            // Clic sur une zone vide (Reverse Geocoding)
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: e.latLng }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const newPlace = {
                        name: results[0].address_components[0]?.long_name || 'Point sur la carte',
                        address: results[0].formatted_address,
                        lat: e.latLng.lat(),
                        lng: e.latLng.lng()
                    };
                    setSelectedPlace(newPlace);
                    setMapCenter({ lat: newPlace.lat, lng: newPlace.lng });
                }
            });
        }
    }, []);

    const handlePlaceSelected = (place) => {
        const newLocation = { lat: place.lat, lng: place.lng };
        setSelectedPlace(place);
        setMapCenter(newLocation);
        if (mapRef.current) {
            mapRef.current.setZoom(15);
            mapRef.current.panTo(newLocation);
        }
    };

    if (!isLoaded) return <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">Chargement de la carte...</div>;

    return (
        <div className="relative w-full h-full">
            <SearchBar onPlaceSelected={handlePlaceSelected} />

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={12}
                onLoad={onMapLoad}
                onClick={handleMapClick}
                options={{ disableDefaultUI: true, zoomControl: true }}
            >
                {activeBlocks.map((block) => (
                    <MarkerF key={block.id} position={{ lat: block.lat, lng: block.lng }} />
                ))}

                <RouteRenderer segments={cachedSegments} />

                {selectedPlace && (
                    <>
                        <MarkerF position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }} animation={window.google.maps.Animation.DROP} />
                        <InfoWindowF position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }} onCloseClick={() => setSelectedPlace(null)}>
                            <div className="p-2 text-black flex flex-col gap-2 min-w-[200px]">
                                <p className="font-bold text-lg">{selectedPlace.name}</p>
                                <p className="text-sm text-gray-600">{selectedPlace.address}</p>
                                <button
                                    onClick={() => { addBlock(selectedPlace); setSelectedPlace(null); }}
                                    className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 mt-1"
                                >
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