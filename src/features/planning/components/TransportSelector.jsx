import { useDateStore } from '../store/useDateStore';

const TRANSPORT_MODES = [
    { 
        id: 'DRIVING', 
        name: 'Voiture',
        svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle><path d="M13 17H9"></path></svg>
    },
    { 
        id: 'TRANSIT', 
        name: 'Transports',
        svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"></rect><path d="M4 11h16"></path><path d="M12 3v8"></path><path d="m8 19-2 3"></path><path d="m16 19 2 3"></path><circle cx="8" cy="15" r="1"></circle><circle cx="16" cy="15" r="1"></circle></svg>
    },
    { 
        id: 'BICYCLING', 
        name: 'Vélo',
        svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18.5" cy="17.5" r="3.5"></circle><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="12" cy="12" r="1.5"></circle><path d="M12 12H7.5l2-5h3.5l1.5-3H18"></path><path d="M12 12 9 7.5"></path></svg>
    },
    { 
        id: 'WALKING', 
        name: 'À pied',
        svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="1"></circle><path d="m18 19-2-4-1-4 1.5-2"></path><path d="M10.5 8.5 13 11l-1.5 7"></path><path d="m7 19 3-4V11l-3-1.5"></path></svg>
    }
];

export default function TransportSelector({ nextBlockId, nextBlockMode, nextBlockRouteIndex, travelInfo }) {
    const updateBlockTravelMode = useDateStore((state) => state.updateBlockTravelMode);
    const updateBlockRouteIndex = useDateStore((state) => state.updateBlockRouteIndex);
    const updateBlockDetails = useDateStore((state) => state.updateBlockDetails);

    const block = useDateStore((state) => state.blocks.find(b => b.id === nextBlockId));
    const isLocked = block?.isTransportLocked || false;

    const toggleLock = () => {
        updateBlockDetails(nextBlockId, { isTransportLocked: !isLocked });
    };

    if (!travelInfo || travelInfo.duration === '0 min' || travelInfo.duration === 'N/A' || nextBlockMode === 'NONE') {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 ml-[1.6rem] pl-[4.5rem] py-3 border-l-2 border-dashed border-gray-200 transition-all select-none">

            {/* 1. LES BOUTONS DE MODES (Masqués si verrouillé) */}
            {!isLocked && (
                <div className="flex gap-1 bg-gray-50 border border-gray-200/70 p-1 rounded-xl w-fit shadow-xs animate-in fade-in duration-200">
                    {TRANSPORT_MODES.map((mode) => {
                        const isActive = nextBlockMode === mode.id;
                        return (
                            <button
                                key={mode.id}
                                onClick={() => updateBlockTravelMode(nextBlockId, mode.id)}
                                title={mode.name}
                                className={`p-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                                    isActive 
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-150' 
                                        : 'bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                                }`}
                            >
                                <span>{mode.svg}</span>
                                <span className="text-[10px] hidden md:inline">{mode.name}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* 2. LES FILTRES DE TRANSPORT EN COMMUN (Sous TRANSIT, si non verrouillé) */}
            {nextBlockMode === 'TRANSIT' && !isLocked && (
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
                                            // Garde au moins un mode coché pour éviter de planter l'API
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
            )}

            {/* 3. LES VARIANTES D'ITINÉRAIRES (Masquées si verrouillé) */}
            {!isLocked && travelInfo?.alternatives?.length > 1 && (
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
            )}

            {/* 4. L'ITINÉRAIRE SÉLECTIONNÉ (Toujours visible) */}
            {travelInfo && (
                <div className="flex flex-col gap-2.5 pr-2 max-w-full">

                    {/* En-tête de l'itinéraire avec le bouton Cadenas */}
                    <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border shadow-xs transition-all ${
                        isLocked 
                            ? 'bg-blue-50/50 border-blue-200 text-blue-800' 
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-200'
                    }`}>
                        <span className="text-[11px] font-extrabold flex items-center gap-2">
                            <span className="text-gray-500">{TRANSPORT_MODES.find(m => m.id === nextBlockMode)?.svg}</span>
                            <span>{travelInfo.duration} ({travelInfo.distance})</span>
                            {isLocked && <span className="text-blue-600 bg-blue-100/50 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">Verrouillé</span>}
                        </span>

                        <button
                            onClick={toggleLock}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isLocked ? 'text-blue-600 hover:bg-blue-100/50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                            title={isLocked ? "Déverrouiller le choix" : "Verrouiller ce trajet"}
                        >
                            {isLocked ? (
                                /* Cadenas fermé */
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            ) : (
                                /* Cadenas ouvert */
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                            )}
                        </button>
                    </div>

                    {/* Le détail des étapes (Les lignes de métro, les minutes de marche...) sous forme de Timeline Verticale */}
                    {nextBlockMode === 'TRANSIT' && travelInfo.steps && (
                        <div className="bg-slate-50/50 rounded-xl p-3.5 border border-slate-200/80 flex flex-col gap-0.5 shadow-xs relative select-none animate-in fade-in duration-300">
                            {travelInfo.steps.map((step, idx) => {
                                const isLastStep = idx === travelInfo.steps.length - 1;
                                return (
                                    <div key={idx} className="flex gap-4 relative">
                                        
                                        {/* Colonne de la Ligne Verticale */}
                                        <div className="flex flex-col items-center shrink-0">
                                            {/* Rond ou Badge */}
                                            {step.type === 'TRANSIT' && step.transit ? (
                                                <div 
                                                    className="flex items-center justify-center font-black text-[9px] rounded-lg w-6 h-6 shrink-0 shadow-sm border border-black/5" 
                                                    style={{ backgroundColor: step.transit.color, color: step.transit.textColor }}
                                                    title={step.transit.line}
                                                >
                                                    {step.transit.line}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center bg-white border border-gray-200 rounded-full w-6 h-6 shrink-0 shadow-xs text-xs">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><circle cx="12" cy="4" r="1"></circle><path d="m18 19-2-4-1-4 1.5-2"></path><path d="M10.5 8.5 13 11l-1.5 7"></path><path d="m7 19 3-4V11l-3-1.5"></path></svg>
                                                </div>
                                            )}
                                            
                                            {/* Ligne connectrice */}
                                            {!isLastStep && (
                                                <div className="w-0.5 h-full min-h-[30px] border-l border-dashed border-gray-300/80 my-1"></div>
                                            )}
                                        </div>

                                        {/* Colonne de Texte/Contenu */}
                                        <div className="flex-1 pb-4 flex flex-col justify-start">
                                            {step.type === 'TRANSIT' && step.transit ? (
                                                <div className="flex flex-col text-[11px] leading-relaxed">
                                                    <span className="font-extrabold text-gray-800 flex items-center gap-1">
                                                        <span className="w-1 h-1 bg-gray-400 rounded-full shrink-0"></span>
                                                        Départ : {step.transit.departure}
                                                    </span>
                                                    <span className="text-gray-500 text-[10px] font-medium ml-2">
                                                        Ligne {step.transit.line} &bull; Dir. {step.transit.direction} &bull; {step.transit.stops} arrêts &bull; {step.duration}
                                                    </span>
                                                    <span className="font-extrabold text-gray-800 flex items-center gap-1 mt-0.5">
                                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></span>
                                                        Arrivée : {step.transit.arrival}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col text-[11px] leading-relaxed text-gray-600 mt-0.5">
                                                    <span dangerouslySetInnerHTML={{ __html: step.instruction }} className="font-bold text-gray-700"></span>
                                                    <span className="text-gray-400 text-[10px] font-semibold mt-0.5">
                                                        Marche &bull; {step.duration} ({step.distance})
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}