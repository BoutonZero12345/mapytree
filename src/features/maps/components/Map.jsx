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