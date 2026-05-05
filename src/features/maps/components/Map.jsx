import { useState, useCallback, useRef, useEffect } from 'react';
// NOUVEAU : On importe PolylineF pour tracer la ligne manuellement
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, DirectionsRenderer, PolylineF } from '@react-google-maps/api';
import SearchBar from './SearchBar';
import { useDateStore } from '../../planning/store/useDateStore';
import { getCachedRoute, saveCachedRoute } from '../../../services/db';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = { lat: 48.8566, lng: 2.3522 };

// NOUVEAU : On ajoute la librairie 'geometry' pour pouvoir décoder le tracé de la route
const libraries = ['places', 'geometry'];

export default function Map() {
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);

    // NOUVEAU : État pour stocker la route mise en cache
    const [cachedPolyline, setCachedPolyline] = useState(null);

    const mapRef = useRef(null);
    const directionsService = useRef(null);

    const blocks = useDateStore((state) => state.blocks);
    const activeScenarioId = useDateStore((state) => state.activeScenarioId);
    const addBlock = useDateStore((state) => state.addBlock);
    const updateTravelInfos = useDateStore((state) => state.updateTravelInfos);

    const activeBlocks = blocks.filter(b => b.scenarioId === activeScenarioId);

    // Génération d'une clé unique pour ce trajet exact (compatible avec les ID Firebase)
    const routeKey = activeBlocks.map(b => `${b.lat}_${b.lng}`).join('-').replace(/\./g, 'p');

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
        if (!window.google || activeBlocks.length < 2) {
            setDirectionsResponse(null);
            setCachedPolyline(null);
            updateTravelInfos([]);
            return;
        }

        const fetchRoute = async () => {
            // 1. On vérifie d'abord si on connaît déjà ce trajet dans Firebase !
            const cachedData = await getCachedRoute(routeKey);

            if (cachedData) {
                console.log("Trajet trouvé en cache ! Économie d'une requête API.");
                setDirectionsResponse(null); // On ne veut pas que Google dessine la route
                setCachedPolyline(cachedData.polyline); // C'est nous qui la dessinerons
                updateTravelInfos(cachedData.travelInfos); // On met à jour la timeline
                return; // On arrête la fonction ici, Google Maps n'est pas appelé !
            }

            // 2. Si non trouvé en cache, on demande à l'API de Google
            console.log("Nouveau trajet : Appel à l'API Google...");
            if (!directionsService.current) {
                directionsService.current = new window.google.maps.DirectionsService();
            }

            const origin = { lat: activeBlocks[0].lat, lng: activeBlocks[0].lng };
            const destination = { lat: activeBlocks[activeBlocks.length - 1].lat, lng: activeBlocks[activeBlocks.length - 1].lng };
            const waypoints = activeBlocks.slice(1, -1).map((block) => ({
                location: { lat: block.lat, lng: block.lng },
                stopover: true
            }));

            directionsService.current.route(
                { origin, destination, waypoints, travelMode: window.google.maps.TravelMode.DRIVING },
                async (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        setDirectionsResponse(result);
                        setCachedPolyline(null);

                        const infos = result.routes[0].legs.map(leg => ({
                            distance: leg.distance.text,
                            duration: leg.duration.text
                        }));

                        updateTravelInfos(infos);

                        // 3. On sauvegarde ce nouveau trajet dans Firebase pour les prochaines fois !
                        await saveCachedRoute(routeKey, {
                            travelInfos: infos,
                            polyline: result.routes[0].overview_polyline // La chaîne de caractères du tracé géométrique
                        });
                    }
                }
            );
        };

        fetchRoute();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routeKey]);

    if (!isLoaded) return <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">Chargement...</div>;

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
                {/* Affichage via l'API fraîche de Google */}
                {directionsResponse && (
                    <DirectionsRenderer options={{ directions: directionsResponse, suppressMarkers: false }} />
                )}

                {/* Affichage via notre cache Firebase (Trace manuelle) */}
                {!directionsResponse && cachedPolyline && (
                    <>
                        {activeBlocks.map((block) => (
                            <MarkerF key={block.id} position={{ lat: block.lat, lng: block.lng }} />
                        ))}
                        <PolylineF
                            path={window.google.maps.geometry.encoding.decodePath(cachedPolyline)}
                            options={{ strokeColor: '#3b82f6', strokeOpacity: 0.8, strokeWeight: 5 }}
                        />
                    </>
                )}

                {/* Affichage classique (pas de trajet calculé) */}
                {!directionsResponse && !cachedPolyline && activeBlocks.map((block) => (
                    <MarkerF key={block.id} position={{ lat: block.lat, lng: block.lng }} />
                ))}

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
                                    Ajouter
                                </button>
                            </div>
                        </InfoWindowF>
                    </>
                )}
            </GoogleMap>
        </div>
    );
}