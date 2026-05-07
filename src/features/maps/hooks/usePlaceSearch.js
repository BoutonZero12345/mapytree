import { useState, useCallback } from 'react';

export function usePlaceSearch(onPlaceSelected) {
    const [autocomplete, setAutocomplete] = useState(null);

    const handleLoad = useCallback((autoC) => {
        setAutocomplete(autoC);
    }, []);

    const handlePlaceChanged = useCallback(() => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();

            // On s'assure que Google a bien trouvé des coordonnées pour ce lieu
            if (place.geometry && place.geometry.location) {
                onPlaceSelected({
                    name: place.name || place.formatted_address.split(',')[0],
                    address: place.formatted_address || '',
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                });
            }
        }
    }, [autocomplete, onPlaceSelected]);

    return { handleLoad, handlePlaceChanged };
}