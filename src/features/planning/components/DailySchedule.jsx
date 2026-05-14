import { useMemo } from 'react';
import { useDateStore } from '../store/useDateStore';

const BLOCK_COLORS = {
    LOCATION: { bg: '#0ea5e9', text: '#ffffff' },
    DRIVING: { bg: '#3b82f6', text: '#ffffff' },
    TRANSIT: { bg: '#8b5cf6', text: '#ffffff' },
    WALKING: { bg: '#10b981', text: '#ffffff' },
    BICYCLING: { bg: '#f59e0b', text: '#ffffff' }
};

export default function DailySchedule() {
    const blocks = useDateStore((state) => state.blocks);
    const activeScenarioId = useDateStore((state) => state.activeScenarioId);
    const travelInfos = useDateStore((state) => state.travelInfos);

    const startTime = useDateStore((state) => state.startTime);
    const setStartTime = useDateStore((state) => state.setStartTime);

    const isExpanded = useDateStore((state) => state.isScheduleExpanded);
    const toggleExpanded = useDateStore((state) => state.toggleScheduleExpanded);

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
            const locationDuration = roundTo5(Number(block.durationMinutes) || 0);
            items.push({
                id: `loc-${block.id}`,
                name: block.name,
                duration: locationDuration,
                startTime: currentMinutes,
                endTime: currentMinutes + locationDuration,
                colors: { bg: block.color || BLOCK_COLORS.LOCATION.bg, text: '#ffffff' }
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
    }, [activeBlocks, travelInfos, startTime]);

    if (activeBlocks.length === 0) return null;

    return (
        <div className={`bg-white shadow-xl z-20 flex-col border-l border-gray-200 overflow-hidden shrink-0 hidden lg:flex transition-[width] duration-300 ease-in-out ${isExpanded ? 'w-[280px] xl:w-[360px]' : 'w-[60px]'}`}>

            <div className={`border-b flex items-center shrink-0 bg-gray-50 h-[60px] ${isExpanded ? 'justify-between px-4' : 'justify-center px-2'}`}>
                <div className="flex items-center gap-2 overflow-hidden">
                    <button
                        onClick={toggleExpanded}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors shrink-0"
                        title={isExpanded ? "Réduire l'agenda" : "Agrandir l'agenda"}
                    >
                        {isExpanded ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        )}
                    </button>

                    <h2 className={`text-sm font-black text-gray-800 uppercase tracking-tight whitespace-nowrap transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                        Déroulé
                    </h2>
                </div>

                <div className={`transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="text-xs font-bold bg-white border border-gray-300 rounded-lg px-2 py-1 outline-none focus:border-blue-500 shadow-sm"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 no-scrollbar relative">
                <div className={`absolute top-0 bottom-0 w-px bg-gray-200 transition-all duration-300 ${isExpanded ? 'left-10' : 'left-7'}`}></div>

                {scheduleItems.map((item) => {
                    const isPunctual = item.duration === 0;
                    const blockHeight = isPunctual ? 24 : Math.max(item.duration * 1.5, 35);

                    return (
                        <div key={item.id} className="flex mb-1 relative" style={{ height: `${blockHeight}px`, alignItems: isPunctual ? 'center' : 'flex-start' }}>

                            <div className={`shrink-0 text-[10px] text-gray-400 font-bold ${isPunctual ? '' : 'pt-1'} text-right transition-all duration-300 overflow-hidden ${isExpanded ? 'w-10 pr-2 opacity-100' : 'w-0 opacity-0'}`}>
                                {formatTime(item.startTime)}
                            </div>

                            <div className="flex-1 relative pl-3 w-full h-full">
                                <div className={`absolute left-[-4.5px] w-2 h-2 rounded-full border-2 border-white z-10 ${isPunctual ? 'top-1/2 -translate-y-1/2' : 'top-2'}`} style={{ backgroundColor: item.colors.bg }}></div>

                                {isPunctual ? (
                                    <div className="w-full h-full flex items-center overflow-hidden" title={`${item.name} (${formatTime(item.startTime)})`}>
                                        <div className={`transition-opacity duration-200 flex items-center w-full ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                            <span className="font-bold text-[11px] truncate" style={{ color: item.colors.bg }}>{item.name}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="rounded-lg p-2 shadow-sm w-full h-full flex flex-col justify-center overflow-hidden border border-black/5"
                                        style={{ backgroundColor: item.colors.bg, color: item.colors.text }}
                                        title={`${item.name} (${formatTime(item.startTime)} - ${formatTime(item.endTime)} | ${item.duration} min)`}
                                    >
                                        <div className={`transition-opacity duration-200 flex justify-between items-center gap-2 w-full ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                            <span className="font-bold text-[11px] truncate flex-1">{item.name}</span>
                                            <div className="flex flex-col items-end shrink-0 text-right">
                                                <span className="font-medium text-[10px] opacity-90">{formatTime(item.startTime)} - {formatTime(item.endTime)}</span>
                                                <span className="text-[9px] opacity-75">{item.duration} min</span>
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