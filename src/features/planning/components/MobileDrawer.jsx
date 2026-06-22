import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDateStore } from '../store/useDateStore';
import Timeline from './Timeline';
import DailySchedule from './DailySchedule';
import PlaceDetailsPanel from './PlaceDetailsPanel';

export default function MobileDrawer() {
    const navigate = useNavigate();
    const [drawerHeight, setDrawerHeight] = useState('half');
    const [mobileTab, setMobileTab] = useState('timeline');
    const currentDateName = useDateStore((state) => state.currentDateName);
    const activePlaceDetails = useDateStore((state) => state.activePlaceDetails);

    useEffect(() => {
        if (activePlaceDetails) {
            setMobileTab('place');
            if (drawerHeight === 'collapsed') setDrawerHeight('half');
        }
    }, [activePlaceDetails]);

    const toggleDrawer = () => {
        if (drawerHeight === 'collapsed') setDrawerHeight('half');
        else if (drawerHeight === 'half') setDrawerHeight('expanded');
        else setDrawerHeight('collapsed');
    };

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-20 bg-white rounded-t-[28px] shadow-[0_-12px_30px_rgba(0,0,0,0.15)] border-t border-gray-200/60 flex flex-col transition-all duration-350 ease-out lg:hidden ${drawerHeight === 'collapsed' ? 'h-[75px]' : drawerHeight === 'half' ? 'h-[48vh]' : 'h-[86vh]'}`}>
            <div onClick={toggleDrawer} className="w-full py-2.5 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 shrink-0 select-none">
                <div className="w-12 h-1 bg-gray-300 rounded-full mb-1" />
            </div>
            <div className="px-4 pb-2 border-b flex items-center justify-between shrink-0 h-[45px]">
                <div className="flex items-center gap-1.5 overflow-hidden mr-2">
                    <button onClick={() => navigate('/')} className="p-1.5 hover:bg-gray-150 rounded-full text-gray-505 shrink-0" title="Quitter">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <h1 className="text-xs font-black text-gray-800 truncate uppercase tracking-wider">{currentDateName || 'Mon Plan'}</h1>
                </div>
                <div className="flex bg-gray-100 p-0.5 rounded-xl text-[10px] font-extrabold shadow-inner border border-gray-200/30 overflow-x-auto no-scrollbar max-w-[70vw]">
                    <button onClick={() => { setMobileTab('timeline'); if (drawerHeight === 'collapsed') setDrawerHeight('half'); }} className={`px-2.5 py-1.5 rounded-lg transition-all ${mobileTab === 'timeline' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-gray-505'}`}>Édition/Favoris</button>
                    <button onClick={() => { setMobileTab('schedule'); if (drawerHeight === 'collapsed') setDrawerHeight('half'); }} className={`px-2.5 py-1.5 rounded-lg transition-all ${mobileTab === 'schedule' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-gray-550'}`}>Déroulé</button>
                    {activePlaceDetails && <button onClick={() => { setMobileTab('place'); if (drawerHeight === 'collapsed') setDrawerHeight('half'); }} className={`px-2.5 py-1.5 rounded-lg transition-all ${mobileTab === 'place' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-gray-555'}`}>Lieu</button>}
                </div>
                <button onClick={() => setDrawerHeight(drawerHeight === 'collapsed' ? 'half' : 'collapsed')} className="p-1.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 shrink-0">
                    {drawerHeight === 'collapsed' ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15" /></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>}
                </button>
            </div>
            <div className={`flex-1 overflow-hidden p-3 bg-white ${drawerHeight === 'collapsed' ? 'hidden' : 'block'}`}>
                {mobileTab === 'timeline' ? <Timeline /> : mobileTab === 'schedule' ? <DailySchedule isMobile={true} /> : <PlaceDetailsPanel isMobile={true} />}
            </div>
        </div>
    );
}
