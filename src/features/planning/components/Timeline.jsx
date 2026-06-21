import { useState } from 'react';
import ScenarioTabs from './ScenarioTabs';
import TimelineHeader from './TimelineHeader';
import PlanTabContent from './PlanTabContent';
import FavoritesTabContent from './FavoritesTabContent';
import TimelineFooter from './TimelineFooter';
import { useDateStore } from '../store/useDateStore';

export default function Timeline() {
    const [activeTab, setActiveTab] = useState('plan');
    const [toastMessage, setToastMessage] = useState(null);
    const addGenericEvent = useDateStore(s => s.addGenericEvent);

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleAddGenericEvent = () => {
        addGenericEvent();
        showToast("Temps libre ajouté au planning");
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            <ScenarioTabs />
            <TimelineHeader />

            <div className="flex gap-2 mb-3 items-center shrink-0">
                <div className="flex flex-1 bg-gray-100 p-1 rounded-xl items-center shadow-inner">
                    <button
                        onClick={() => setActiveTab('plan')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'plan' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Mon Plan
                    </button>
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${activeTab === 'favorites' ? 'bg-white text-yellow-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Favoris"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </button>
                </div>
                {activeTab === 'plan' && (
                    <button
                        onClick={handleAddGenericEvent}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all font-bold flex items-center justify-center border border-blue-100 hover:scale-105 shrink-0 shadow-sm"
                        title="Ajouter un temps libre"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                )}
            </div>

            {activeTab === 'plan' ? <PlanTabContent /> : <FavoritesTabContent showToast={showToast} />}

            <TimelineFooter />

            {toastMessage && (
                <div className="fixed bottom-4 left-4 right-4 md:left-[20px] md:right-auto md:w-[350px] z-50 bg-slate-900/90 text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-300 backdrop-blur-md border border-white/10 text-xs font-bold">
                    <div className="flex items-center gap-2">
                        <svg className="text-green-400 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span>{toastMessage}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setToastMessage(null); }} className="text-white/70 hover:text-white p-0.5 rounded">✕</button>
                </div>
            )}
        </div>
    );
}