import { useDateStore } from '../store/useDateStore';

const TRANSPORT_MODES = [
    { id: 'DRIVING', icon: '🚗', name: 'Voiture' },
    { id: 'TRANSIT', icon: '🚇', name: 'Transports' },
    { id: 'BICYCLING', icon: '🚲', name: 'Vélo' },
    { id: 'WALKING', icon: '🚶', name: 'À pied' }
];

export default function TransportSelector({ nextBlockId, nextBlockMode, nextBlockRouteIndex, travelInfo }) {
    const updateBlockTravelMode = useDateStore((state) => state.updateBlockTravelMode);
    const updateBlockRouteIndex = useDateStore((state) => state.updateBlockRouteIndex);

    return (
        <div className="flex flex-col gap-2 ml-[1.8rem] pl-[4.75rem] py-3 border-l-2 border-dashed border-gray-300">

            <div className="flex gap-1 bg-white p-1 rounded-lg border border-gray-200 w-fit shadow-sm">
                {TRANSPORT_MODES.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => updateBlockTravelMode(nextBlockId, mode.id)}
                        title={mode.name}
                        className={`p-1.5 rounded-md text-sm transition-all ${nextBlockMode === mode.id ? 'bg-blue-600 text-white shadow-md' : 'bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
                    >
                        {mode.icon}
                    </button>
                ))}
            </div>

            {travelInfo?.alternatives?.length > 1 && (
                <div className="flex flex-col gap-1 mt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Variantes disponibles :</span>
                    <div className="flex flex-wrap gap-2">
                        {travelInfo.alternatives.map((alt, altIdx) => (
                            <button
                                key={altIdx}
                                onClick={() => updateBlockRouteIndex(nextBlockId, altIdx)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${nextBlockRouteIndex === altIdx
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                {alt.duration} ({alt.summary})
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {travelInfo && (
                <div className="mt-1 flex flex-col gap-2 pr-2">
                    <span className="text-sm text-gray-600 font-bold flex items-center gap-1">
                        {TRANSPORT_MODES.find(m => m.id === nextBlockMode)?.icon} Itinéraire choisi : {travelInfo.duration}
                    </span>

                    {nextBlockMode === 'TRANSIT' && travelInfo.steps && (
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex flex-col gap-3 shadow-sm">
                            {travelInfo.steps.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-3">

                                    {/* CORRECTION : On vérifie que step.transit existe bien */}
                                    {step.type === 'TRANSIT' && step.transit ? (
                                        <>
                                            <div className="flex items-center justify-center font-extrabold text-[11px] rounded w-7 h-7 shrink-0 shadow-sm" style={{ backgroundColor: step.transit.color, color: step.transit.textColor }}>
                                                {step.transit.line}
                                            </div>
                                            <div className="flex flex-col text-xs mt-0.5">
                                                <span className="font-bold text-gray-800">De : {step.transit.departure}</span>
                                                <span className="text-gray-500">Dir. {step.transit.direction} ({step.transit.stops} arrêts)</span>
                                                <span className="font-bold text-gray-800 mt-1">À : {step.transit.arrival}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-center w-7 h-7 shrink-0 text-lg">🚶</div>
                                            <div className="flex flex-col text-xs mt-1 text-gray-600">
                                                {/* Le dangerouslySetInnerHTML récupère maintenant la phrase générée en français par Google */}
                                                <span dangerouslySetInnerHTML={{ __html: step.instruction }}></span>
                                                <span className="text-gray-400 font-medium">{step.duration} ({step.distance})</span>
                                            </div>
                                        </>
                                    )}

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}