export default function RouteStepsList({ steps }) {
    return (
        <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-200/80 flex flex-col gap-0.5 shadow-xs animate-in fade-in duration-200">
            {steps.map((step, idx) => {
                const isLast = idx === steps.length - 1;
                return (
                    <div key={idx} className="flex gap-3 text-[10px]">
                        <div className="flex flex-col items-center shrink-0">
                            {step.type === 'TRANSIT' && step.transit ? (
                                <div className="flex items-center justify-center font-black rounded text-[8px] w-5.5 h-5.5 border border-black/5" style={{ backgroundColor: step.transit.color, color: step.transit.textColor }}>{step.transit.line}</div>
                            ) : (
                                <div className="flex items-center justify-center bg-white border border-gray-200 rounded-full w-5.5 h-5.5 text-xs"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><circle cx="12" cy="4" r="1" /><path d="m18 19-2-4-1-4 1.5-2" /><path d="M10.5 8.5 13 11l-1.5 7" /><path d="m7 19 3-4V11l-3-1.5" /></svg></div>
                            )}
                            {!isLast && <div className="w-0.5 h-full min-h-[25px] border-l border-dashed border-gray-300 my-1" />}
                        </div>
                        <div className="flex-1 pb-3 flex flex-col">
                            {step.type === 'TRANSIT' && step.transit ? (
                                <div className="flex flex-col leading-snug">
                                    <span className="font-extrabold text-gray-800">Départ : {step.transit.departure}</span>
                                    <span className="text-gray-500 font-medium text-[9px]">Ligne {step.transit.line} &bull; Dir. {step.transit.direction} &bull; {step.transit.stops} arrêts &bull; {step.duration}</span>
                                    <span className="font-extrabold text-gray-800 mt-0.5">Arrivée : {step.transit.arrival}</span>
                                </div>
                            ) : (
                                <div className="flex flex-col leading-snug text-gray-600">
                                    <span dangerouslySetInnerHTML={{ __html: step.instruction }} className="font-bold text-gray-700" />
                                    <span className="text-gray-400 font-semibold text-[9px] mt-0.5">Marche &bull; {step.duration} ({step.distance})</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
