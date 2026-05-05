import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, DirectionsRenderer } from '@react-google-maps/api';
import SearchBar from './SearchBar';
import { useDateStore } from '../../planning/store/useDateStore';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = {
    lat: 48.8566,
    lng: 2.3522
};

const libraries = ['places'];

export default function Map() {
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const mapRef = useRef(null);
    const directionsService = useRef(null);

    const blocks = useDateStore((state) => state.blocks);
    const addBlock = useDateStore((state) => state.addBlock);
    const updateTravelInfos = useDateStore((state) => state.updateTravelInfos);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: libraries
    });

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
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

    useEffect(() => {
        if (!window.google || blocks.length < 2) {
            setDirectionsResponse(null);
            updateTravelInfos([]);
            return;
        }

        if (!directionsService.current) {
            directionsService.current = new window.google.maps.DirectionsService();
        }

        const origin = { lat: blocks[0].lat, lng: blocks[0].lng };
        const destination = { lat: blocks[blocks.length - 1].lat, lng: blocks[blocks.length - 1].lng };

        const waypoints = blocks.slice(1, -1).map((block) => ({
            location: { lat: block.lat, lng: block.lng },
            stopover: true
        }));

        directionsService.current.route(
            {
                origin: origin,
                destination: destination,
                waypoints: waypoints,
                travelMode: window.google.maps.TravelMode.DRIVING
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirectionsResponse(result);
                    const legs = result.routes[0].legs;
                    const infos = legs.map(leg => ({
                        distance: leg.distance.text,
                        duration: leg.duration.text
                    }));
                    updateTravelInfos(infos);
                }
            }
        );
    }, [blocks, updateTravelInfos]);

    if (!isLoaded) return <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">Chargement...</div>;

    return (
        <div className="relative w-full h-full">
            <SearchBar onPlaceSelected={handlePlaceSelected} />

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={12}
                onLoad={onMapLoad}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                }}
            >
                {directionsResponse ? (
                    <DirectionsRenderer
                        options={{
                            directions: directionsResponse,
                            suppressMarkers: false
                        }}
                    />
                ) : (
                    blocks.map((block) => (
                        <MarkerF key={block.id} position={{ lat: block.lat, lng: block.lng }} />
                    ))
                )}

                {selectedPlace && (
                    <>
                        <MarkerF
                            position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
                            animation={window.google.maps.Animation.DROP}
                        />
                        <InfoWindowF
                            position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
                            onCloseClick={() => setSelectedPlace(null)}
                        >
                            <div className="p-2 text-black flex flex-col gap-2 min-w-[200px]">
                                <p className="font-bold text-lg">{selectedPlace.name}</p>
                                <p className="text-sm text-gray-600">{selectedPlace.address}</p>
                                <button
                                    onClick={() => {
                                        addBlock(selectedPlace);
                                        setSelectedPlace(null);
                                    }}
                                    className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors mt-1"
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