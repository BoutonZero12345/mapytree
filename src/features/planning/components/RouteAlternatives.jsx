export default function RouteAlternatives({ travelInfo, nextBlockRouteIndex, nextBlockId, updateBlockRouteIndex, isLocked }) {
    if (isLocked || !travelInfo || !travelInfo.alternatives || travelInfo.alternatives.length <= 1) return null;
    return (
        <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Variantes disponibles :</span>
            <div className="flex flex-wrap gap-1.5">
                {travelInfo.alternatives.map((alt, altIdx) => {
                    const isActive = nextBlockRouteIndex === altIdx;
                    return (
                        <button
                            key={altIdx}
                            onClick={() => updateBlockRouteIndex(nextBlockId, altIdx)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold transition-all border cursor-pointer ${
                                isActive
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm font-black'
                                    : 'bg-white border-gray-250 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            {alt.duration} ({alt.summary})
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
