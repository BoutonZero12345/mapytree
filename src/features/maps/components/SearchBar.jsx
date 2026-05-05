import { useState, useEffect, useRef } from 'react';

export default function SearchBar({ onPlaceSelected }) {
    const [input, setInput] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const autocompleteService = useRef(null);
    const geocoder = useRef(null);

    useEffect(() => {
        if (!window.google) return;
        if (!autocompleteService.current) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
        }
        if (!geocoder.current) {
            geocoder.current = new window.google.maps.Geocoder();
        }
    }, []);

    useEffect(() => {
        if (!input.trim()) {
            setPredictions([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(() => {
            if (autocompleteService.current) {
                autocompleteService.current.getPlacePredictions(
                    { input },
                    (results, status) => {
                        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                            setPredictions(results);
                            setIsOpen(true);
                        } else {
                            setPredictions([]);
                        }
                    }
                );
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [input]);

    const handleSelect = (placeId, description) => {
        setInput(description);
        setIsOpen(false);
        setPredictions([]);

        if (geocoder.current) {
            geocoder.current.geocode({ placeId }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const location = results[0].geometry.location;
                    onPlaceSelected({
                        name: description.split(',')[0],
                        lat: location.lat(),
                        lng: location.lng(),
                        placeId: placeId,
                        address: description,
                    });
                }
            });
        }
    };

    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md z-10">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Rechercher un lieu, un restaurant..."
                className="w-full px-5 py-3 rounded-full shadow-lg border-none focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 bg-white"
            />

            {isOpen && predictions.length > 0 && (
                <ul className="absolute top-full left-0 w-full bg-white mt-2 rounded-2xl shadow-xl overflow-hidden z-20">
                    {predictions.map((prediction) => (
                        <li
                            key={prediction.place_id}
                            onClick={() => handleSelect(prediction.place_id, prediction.description)}
                            className="px-5 py-3 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-none"
                        >
                            {prediction.description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}