import { useState, useEffect, useRef } from 'react';
import { useDateStore } from '../../planning/store/useDateStore';
import { getCachedRoute, saveCachedRoute } from '../../../services/db';

export function useRouteLogic(activeBlocks) {
    const [cachedSegments, setCachedSegments] = useState([]);
    const directionsService = useRef(null);
    const updateTravelInfos = useDateStore((state) => state.updateTravelInfos);

    const routeKey = activeBlocks.map(b => `${b.lat}_${b.lng}_${b.travelMode}_${b.selectedRouteIndex}`).join('-').replace(/\./g, 'p');

    const blocksRef = useRef(activeBlocks);
    blocksRef.current = activeBlocks;

    useEffect(() => {
        const blocksToProcess = blocksRef.current;

        if (!window.google || blocksToProcess.length < 2) {
            setCachedSegments([]);
            updateTravelInfos([]);
            return;
        }

        const fetchAllSegments = async () => {
            if (!directionsService.current) {
                directionsService.current = new window.google.maps.DirectionsService();
            }

            let newInfos = [];
            let newSegments = [];

            for (let i = 0; i < blocksToProcess.length - 1; i++) {
                const from = blocksToProcess[i];
                const to = blocksToProcess[i + 1];

                // SI L'UN DES DEUX N'A PAS DE COORDONNÉES, ON NE CALCULE PAS D'ITINÉRAIRE
                if (!from.lat || !from.lng || !to.lat || !to.lng) {
                    newInfos.push({ duration: '0 min', distance: '0 km', summary: '', steps: [], alternatives: [] });
                    newSegments.push([]);
                    continue;
                }

                const mode = to.travelMode || 'DRIVING';
                const selectedIdx = to.selectedRouteIndex || 0;

                // PASSAGE À V5 pour forcer les textes en français depuis l'API
                const segmentKey = `seg_v5_${from.lat}_${from.lng}_to_${to.lat}_${to.lng}_${mode}`.replace(/\./g, 'p');
                const cachedData = await getCachedRoute(segmentKey);

                let routesData;
                if (cachedData) {
                    routesData = cachedData.allRoutes;
                } else {
                    try {
                        const result = await new Promise((resolve, reject) => {
                            directionsService.current.route({
                                origin: { lat: from.lat, lng: from.lng },
                                destination: { lat: to.lat, lng: to.lng },
                                travelMode: window.google.maps.TravelMode[mode],
                                provideRouteAlternatives: true
                            }, (res, status) => status === 'OK' ? resolve(res) : reject(status));
                        });

                        routesData = result.routes.map(route => {
                            const leg = route.legs[0];
                            return {
                                summary: route.summary || leg.steps.find(s => s.transit)?.transit.line.short_name || "Itinéraire",
                                distance: leg.distance.text,
                                duration: leg.duration.text,
                                steps: leg.steps.map(step => ({
                                    type: step.travel_mode,
                                    instruction: step.instructions,
                                    distance: step.distance.text,
                                    duration: step.duration.text,
                                    polyline: step.polyline.points,
                                    transit: step.transit ? {
                                        line: step.transit.line.short_name || step.transit.line.name,
                                        color: step.transit.line.color || '#8b5cf6',
                                        textColor: step.transit.line.text_color || '#ffffff',
                                        departure: step.transit.departure_stop.name,
                                        arrival: step.transit.arrival_stop.name,
                                        direction: step.transit.headsign,
                                        stops: step.transit.num_stops
                                    } : null
                                }))
                            };
                        });

                        await saveCachedRoute(segmentKey, { allRoutes: routesData });
                    } catch (error) {
                        console.error(error);
                        routesData = [{ distance: 'N/A', duration: 'N/A', summary: 'Erreur', steps: [] }];
                    }
                }

                const chosenRoute = routesData[selectedIdx] || routesData[0];

                newInfos.push({
                    ...chosenRoute,
                    alternatives: routesData.map(r => ({ summary: r.summary, duration: r.duration }))
                });

                newSegments.push(chosenRoute.steps.map(step => ({
                    path: step.polyline,
                    color: step.transit?.color || (step.type === 'WALKING' ? '#10b981' : (mode === 'DRIVING' ? '#3b82f6' : '#f59e0b')),
                    mode: step.type
                })));
            }

            updateTravelInfos(newInfos);
            setCachedSegments(newSegments);
        };

        fetchAllSegments();
    }, [routeKey, updateTravelInfos]);

    return { cachedSegments };
}