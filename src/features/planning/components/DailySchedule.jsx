import { useMemo } from 'react';
import { useDateStore } from '../store/useDateStore';

const BLOCK_COLORS = {
    LOCATION: { bg: '#0ea5e9', text: '#ffffff' },
    DRIVING: { bg: '#3b82f6', text: '#ffffff' },
    TRANSIT: { bg: '#8b5cf6', text: '#ffffff' },
    WALKING: { bg: '#10b981', text: '#ffffff' },
    BICYCLING: { bg: '#f59e0b', text: '#ffffff' }
};

export default function DailySchedule({ isMobile = false }) {
    const blocks = useDateStore((state) => state.blocks);
    const activeScenarioId = useDateStore((state) => state.activeScenarioId);
    const travelInfos = useDateStore((state) => state.travelInfos);

    const startTime = useDateStore((state) => state.startTime);
    const setStartTime = useDateStore((state) => state.setStartTime);

    const isExpanded = useDateStore((state) => state.isScheduleExpanded);
    const toggleExpanded = useDateStore((state) => state.toggleScheduleExpanded);
    const selectedDays = useDateStore((state) => state.selectedDays || []);

    const activeBlocks = blocks.filter(b => b.scenarioId === activeScenarioId);

    const roundTo5 = (minutes) => Math.round(minutes / 5) * 5;

    const parseTravelTime = (durationText) => {
        if (!durationText) return 0;
        let totalMinutes = 0;
        const hoursMatch = durationText.match(/(\d+)\s*(h|heure|hour)/i);
        const minsMatch = durationText.match(/(\d+)\s*(m|min)/i);
        if (hoursMatch) totalMinutes += parseInt(hoursMatch[1], 10) * 60;
        if (minsMatch) totalMinutes += parseInt(minsMatch[1], 10);
        return totalMinutes;
    };

    const formatTime = (totalMins) => {
        const h = Math.floor(totalMins / 60) % 24;
        const m = totalMins % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const scheduleItems = useMemo(() => {
        const [startH, startM] = startTime.split(':').map(Number);
        let currentMinutes = startH * 60 + startM;
        const items = [];

        activeBlocks.forEach((block, index) => {
            // NOUVEAU : Gestion de l'heure fixe
            if (block.fixedStartTime) {
                const [fH, fM] = block.fixedStartTime.split(':').map(Number);
                const fixedMinutes = fH * 60 + fM;

                // Si l'heure fixée est plus tard que l'heure d'arrivée prévue, on ajoute du "Temps libre"
                if (fixedMinutes > currentMinutes) {
                    items.push({
                        id: `free-${block.id}`,
                        name: 'Temps libre',
                        duration: fixedMinutes - currentMinutes,
                        startTime: currentMinutes,
                        endTime: fixedMinutes,
                        colors: { bg: '#f3f4f6', text: '#9ca3af' }, // Gris très clair (gray-100)
                        isFreeTime: true
                    });
                }
                // On cale l'horloge sur l'heure fixée (même si on est en retard, pour forcer le planning)
                currentMinutes = fixedMinutes;
            }

            const locationDuration = roundTo5(Number(block.durationMinutes) || 0);
            
            // NOUVEAU : Alerte si fermé un des jours du planning
            const closedDayAlert = block.openingHours && selectedDays.length > 0 && (() => {
                for (const day of selectedDays) {
                    const line = block.openingHours.find(l => l.startsWith(day));
                    if (line && (line.includes('Fermé') || line.includes('Closed'))) {
                        return `Fermé le ${day}`;
                    }
                }
                return null;
            })();

            items.push({
                id: `loc-${block.id}`,
                name: block.name,
                duration: locationDuration,
                startTime: currentMinutes,
                endTime: currentMinutes + locationDuration,
                colors: { bg: block.color || BLOCK_COLORS.LOCATION.bg, text: '#ffffff' },
                closedDayAlert: closedDayAlert
            });
            currentMinutes += locationDuration;

            if (index < activeBlocks.length - 1 && travelInfos[index]) {
                const rawTravelMinutes = parseTravelTime(travelInfos[index].duration);
                if (rawTravelMinutes > 0) {
                    const travelDuration = roundTo5(rawTravelMinutes);
                    const travelMode = activeBlocks[index + 1]?.travelMode || 'DRIVING';
                    items.push({
                        id: `travel-${block.id}`,
                        name: `Trajet`,
                        duration: travelDuration,
                        startTime: currentMinutes,
                        endTime: currentMinutes + travelDuration,
                        colors: BLOCK_COLORS[travelMode] || BLOCK_COLORS.DRIVING
                    });
                    currentMinutes += travelDuration;
                }
            }
        });
        return items;
    }, [activeBlocks, travelInfos, startTime, selectedDays]);

    if (activeBlocks.length === 0) return null;

    if (isMobile) {
        return (
            <div className="bg-white flex flex-col h-full w-full overflow-hidden">
                <div className="border-b flex items-center justify-between shrink-0 bg-gray-50 h-[50px] px-4">
                    <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider">
                        Déroulé de la journée
                    </h2>
                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="text-xs font-bold bg-white border border-gray-300 rounded-lg px-2 py-1 outline-none focus:border-blue-500 shadow-sm"
                    />
                </div>
                <div className="flex-1 overflow-y-auto p-4 relative no-scrollbar">
                    <div className="absolute top-0 bottom-0 w-px bg-gray-200 left-10"></div>
                    {scheduleItems.map((item) => {
                        const isPunctual = item.duration === 0;
                        const blockHeight = isPunctual ? 24 : Math.max(item.duration * 1.5, 35);
                        return (
                            <div key={item.id} className="flex mb-1 relative" style={{ height: `${blockHeight}px`, alignItems: isPunctual ? 'center' : 'flex-start' }}>
                                <div className="shrink-0 text-[10px] text-gray-400 font-bold pt-1 text-right w-10 pr-2">
                                    {formatTime(item.startTime)}
                                </div>
                                <div className="flex-1 relative pl-3 w-full h-full">
                                    <div className="absolute left-[-4.5px] w-2 h-2 rounded-full border-2 border-white z-10 top-2" style={{ backgroundColor: item.closedDayAlert ? '#ef4444' : item.colors.bg }}></div>
                                    {isPunctual ? (
                                        <div className="w-full h-full flex items-center overflow-hidden" title={`${item.name} (${formatTime(item.startTime)})`}>
                                            <span className="font-bold text-[11px] truncate flex items-center gap-1" style={{ color: item.closedDayAlert ? '#ef4444' : item.colors.bg }}>
                                                {item.closedDayAlert && <span className="text-[8px] bg-red-650 text-white font-black px-1 rounded uppercase tracking-wider scale-95 shrink-0">Fermé</span>}
                                                {item.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <div
                                            className={`rounded-lg p-2 shadow-sm w-full h-full flex flex-col justify-center overflow-hidden border ${
                                                item.closedDayAlert 
                                                    ? 'bg-red-600 text-white border-red-700 animate-pulse' 
                                                    : 'border-black/5'
                                            }`}
                                            style={item.closedDayAlert ? {} : { backgroundColor: item.colors.bg, color: item.colors.text }}
                                        >
                                            <div className="flex justify-between items-center gap-2 w-full">
                                                <span className="font-bold text-[11px] truncate flex-1 flex items-center gap-1">
                                                    {item.closedDayAlert && <span className="text-[8px] bg-white text-red-650 font-black px-1 rounded uppercase tracking-wider shrink-0 shadow-sm border border-red-100">Fermé</span>}
                                                    {item.name}
                                                </span>
                                                <div className="flex flex-col items-end shrink-0 text-right">
                                                    <span className="font-medium text-[10px] opacity-90">{formatTime(item.startTime)} - {formatTime(item.endTime)}</span>
                                                    <span className="text-[9px] opacity-75">{item.closedDayAlert ? item.closedDayAlert : `${item.duration} min`}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-xl z-20 flex flex-col border-r border-gray-200 overflow-hidden shrink-0 hidden lg:flex w-[280px] xl:w-[360px] h-full">

            <div className="border-b flex items-center justify-between shrink-0 bg-gray-50 h-[60px] px-4">
                <h2 className="text-sm font-black text-gray-800 uppercase tracking-tight whitespace-nowrap">
                    Déroulé
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 no-scrollbar relative animate-in fade-in duration-300">
                <div className="absolute top-0 bottom-0 w-px bg-gray-200 left-10"></div>

                {scheduleItems.map((item) => {
                    const isPunctual = item.duration === 0;
                    const blockHeight = isPunctual ? 24 : Math.max(item.duration * 1.5, 35);

                    return (
                        <div key={item.id} className="flex mb-1 relative" style={{ height: `${blockHeight}px`, alignItems: isPunctual ? 'center' : 'flex-start' }}>

                            <div className="shrink-0 text-[10px] text-gray-400 font-bold pt-1 text-right w-10 pr-2">
                                {formatTime(item.startTime)}
                            </div>

                            <div className="flex-1 relative pl-3 w-full h-full">
                                <div className={`absolute left-[-4.5px] w-2 h-2 rounded-full border-2 border-white z-10 ${isPunctual ? 'top-1/2 -translate-y-1/2' : 'top-2'}`} style={{ backgroundColor: item.closedDayAlert ? '#ef4444' : item.colors.bg }}></div>

                                {isPunctual ? (
                                    <div className="w-full h-full flex items-center overflow-hidden animate-in fade-in duration-200" title={`${item.name} (${formatTime(item.startTime)})`}>
                                        <span className="font-bold text-[11px] truncate flex items-center gap-1" style={{ color: item.closedDayAlert ? '#ef4444' : item.colors.bg }}>
                                            {item.closedDayAlert && <span className="text-[8px] bg-red-650 text-white font-black px-1 rounded uppercase tracking-wider scale-95 shrink-0">Fermé</span>}
                                            {item.name}
                                        </span>
                                    </div>
                                ) : (
                                    <div
                                        className={`rounded-lg p-2 shadow-sm w-full h-full flex flex-col justify-center overflow-hidden border animate-in fade-in duration-200 ${
                                            item.closedDayAlert 
                                                ? 'bg-red-600 text-white border-red-700 animate-pulse' 
                                                : 'border-black/5'
                                        }`}
                                        style={item.closedDayAlert ? {} : { backgroundColor: item.colors.bg, color: item.colors.text }}
                                        title={`${item.name} (${formatTime(item.startTime)} - ${formatTime(item.endTime)} | ${item.duration} min)`}
                                    >
                                        <div className="flex justify-between items-center gap-2 w-full">
                                            <span className="font-bold text-[11px] truncate flex-1 flex items-center gap-1">
                                                {item.closedDayAlert && <span className="text-[8px] bg-white text-red-650 font-black px-1 rounded uppercase tracking-wider shrink-0 shadow-sm border border-red-100 animate-pulse">Fermé</span>}
                                                {item.name}
                                            </span>
                                            <div className="flex flex-col items-end shrink-0 text-right">
                                                <span className="font-medium text-[10px] opacity-90">{formatTime(item.startTime)} - {formatTime(item.endTime)}</span>
                                                <span className="text-[9px] opacity-75">{item.closedDayAlert ? item.closedDayAlert : `${item.duration} min`}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}