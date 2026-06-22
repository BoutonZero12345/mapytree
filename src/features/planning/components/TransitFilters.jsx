export default function TransitFilters({ block, nextBlockId, updateBlockDetails, nextBlockMode, isLocked }) {
    if (nextBlockMode !== 'TRANSIT' || isLocked) return null;
    return (
        <div className="flex flex-col gap-1.5 bg-blue-50/30 border border-blue-100/50 rounded-xl p-2.5 w-fit max-w-full animate-in fade-in duration-200">
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider">Filtres de transports préférés :</span>
            <div className="flex flex-wrap gap-1">
                {[
                    { id: 'SUBWAY', label: 'Métro', color: 'bg-yellow-50 text-yellow-750 border-yellow-300 hover:bg-yellow-100/40' },
                    { id: 'RER', label: 'RER', color: 'bg-red-50 text-red-755 border-red-305 hover:bg-red-100/40' },
                    { id: 'BUS', label: 'Bus', color: 'bg-blue-50 text-blue-755 border-blue-305 hover:bg-blue-100/40' },
                    { id: 'TRAM', label: 'Tramway', color: 'bg-green-50 text-green-755 border-green-305 hover:bg-green-100/40' },
                    { id: 'TRANSILIEN', label: 'Transilien', color: 'bg-purple-50 text-purple-755 border-purple-305 hover:bg-purple-100/40' },
                    { id: 'TER', label: 'TER', color: 'bg-cyan-50 text-cyan-755 border-cyan-305 hover:bg-cyan-100/40' }
                ].map(modeOpt => {
                    const allowedModes = block?.allowedTransitModes || ['SUBWAY', 'RER', 'BUS', 'TRAM', 'TRANSILIEN', 'TER'];
                    const isChecked = allowedModes.includes(modeOpt.id);
                    return (
                        <button
                            key={modeOpt.id}
                            type="button"
                            onClick={() => {
                                let updated = [];
                                if (isChecked) {
                                    if (allowedModes.length > 1) {
                                        updated = allowedModes.filter(m => m !== modeOpt.id);
                                    } else {
                                        updated = allowedModes;
                                    }
                                } else {
                                    updated = [...allowedModes, modeOpt.id];
                                }
                                updateBlockDetails(nextBlockId, { allowedTransitModes: updated });
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                isChecked 
                                    ? `${modeOpt.color} border-current font-black scale-102 shadow-xs` 
                                    : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                            }`}
                        >
                            {isChecked ? '✓' : '+'} {modeOpt.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
