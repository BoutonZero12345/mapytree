const parseMins = (txt) => {
    if (!txt) return 0;
    const h = txt.match(/(\d+)\s*(h|heure|hour)/i);
    const m = txt.match(/(\d+)\s*(m|min)/i);
    return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
};

const getVehicleLabel = (line) => {
    const lineStr = String(line).toUpperCase().trim();
    if (/^[A-E]$|^RER/.test(lineStr)) return 'RER';
    if (/^T\d+/.test(lineStr)) return 'tramway';
    if (/^\d+$/.test(lineStr) && parseInt(lineStr) <= 14) return 'métro';
    if (/^\d+$/.test(lineStr) && parseInt(lineStr) > 14) return 'bus';
    return 'métro';
};

export default function RouteSummary({ steps }) {
    let walkMinutes = 0;
    const transitSteps = [];
    
    steps.forEach(step => {
        if (step.type === 'TRANSIT' && step.transit) {
            transitSteps.push({
                line: step.transit.line,
                duration: step.duration,
                color: step.transit.color,
                textColor: step.transit.textColor
            });
        } else {
            walkMinutes += parseMins(step.duration);
        }
    });

    return (
        <div className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-200/80 flex flex-col gap-1.5 shadow-xs text-[10px] font-bold text-gray-600 animate-in fade-in duration-200">
            {walkMinutes > 0 && (
                <div className="flex items-center gap-1.5">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" className="shrink-0"><circle cx="12" cy="4" r="1" /><path d="m18 19-2-4-1-4 1.5-2" /><path d="M10.5 8.5 13 11l-1.5 7" /><path d="m7 19 3-4V11l-3-1.5" /></svg>
                    <span>Marche : {walkMinutes} minutes</span>
                </div>
            )}
            {transitSteps.map((ts, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                    <span className="flex items-center justify-center font-black text-[8px] rounded w-4.5 h-4.5 shrink-0 border border-black/5" style={{ backgroundColor: ts.color, color: ts.textColor }}>{ts.line}</span>
                    <span className="capitalize text-gray-700">{getVehicleLabel(ts.line)} {ts.line} : {ts.duration}</span>
                </div>
            ))}
        </div>
    );
}
