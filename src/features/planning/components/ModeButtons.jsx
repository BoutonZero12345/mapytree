export const TRANSPORT_MODES = [
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

export default function ModeButtons({ nextBlockId, nextBlockMode, updateBlockTravelMode, isLocked }) {
    if (isLocked) return null;
    return (
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
    );
}
