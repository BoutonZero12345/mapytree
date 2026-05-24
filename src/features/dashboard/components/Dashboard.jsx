import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDates, createNewDate, deleteDatePlan, updateDateName } from '../../../services/db';
import { useDateStore } from '../../planning/store/useDateStore';
import CreatePlanForm from './CreatePlanForm';
import PlanCard from './PlanCard';
import PlaceDetailsModal from '../../planning/components/PlaceDetailsModal';

export default function Dashboard() {
    const [dates, setDates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('plans'); // 'plans' ou 'favorites'
    const [activeFavDetails, setActiveFavDetails] = useState(null); // NOUVEAU
    const navigate = useNavigate();

    // Zustand store pour les favoris
    const favorites = useDateStore((state) => state.favorites || []);
    const categories = useDateStore((state) => state.categories || []);
    const loadFavorites = useDateStore((state) => state.loadFavorites);
    const deleteFavorite = useDateStore((state) => state.deleteFavorite);

    const fetchDates = async () => {
        setIsLoading(true);
        const data = await getAllDates();
        setDates(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchDates();
        if (loadFavorites) {
            loadFavorites();
        }
    }, [loadFavorites]);

    const handleCreate = async (name) => {
        const newDate = await createNewDate(name);
        if (newDate) navigate(`/plan/${newDate.id}`);
    };

    const handleDelete = async (id) => {
        await deleteDatePlan(id);
        fetchDates();
    };

    const handleSaveEdit = async (id, newName) => {
        await updateDateName(id, newName);
        fetchDates();
    };

    return (
        <div className="min-h-[100dvh] bg-gradient-to-tr from-slate-50 via-gray-50 to-blue-50/30 p-4 md:p-6 flex flex-col items-center">
            <div className="max-w-3xl w-full mt-4 md:mt-10">
                <div className="flex flex-col items-center mb-6 md:mb-8">
                    <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                        Mapytree
                    </h1>
                    <p className="text-xs md:text-sm text-gray-500 font-medium mt-2">Planificateur d'itinéraires et de journées mémorables</p>
                </div>

                <CreatePlanForm onCreate={handleCreate} />

                {/* Switcher d'onglets de l'accueil */}
                <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 shadow-inner">
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`flex-1 py-3 px-4 text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'plans'
                                ? 'bg-white text-blue-600 shadow-md'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                        }`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Mes Sorties ({dates.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`flex-1 py-3 px-4 text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'favorites'
                                ? 'bg-white text-yellow-600 shadow-md'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                        }`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        Mes Favoris ({favorites.length})
                    </button>
                </div>

                {activeTab === 'plans' ? (
                    <div>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                <p className="text-gray-500 text-sm">Chargement des sorties...</p>
                            </div>
                        ) : dates.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed p-6">
                                <p className="text-gray-500 text-sm">Aucun planning enregistré pour le moment. Commencez par en créer un ci-dessus !</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 md:gap-4">
                                {dates.map(date => (
                                    <PlanCard
                                        key={date.id}
                                        date={date}
                                        onClick={(id) => navigate(`/plan/${id}`)}
                                        onDelete={handleDelete}
                                        onSaveEdit={handleSaveEdit}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {favorites.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed p-6 flex flex-col items-center">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300 mb-2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <p className="text-gray-500 text-sm">Vous n'avez pas encore de favoris.</p>
                                <p className="text-xs text-gray-400 mt-1">Ajoutez des lieux d'intérêt depuis la carte dans vos plannings pour les retrouver ici !</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {favorites.map(fav => {
                                    const cat = categories.find(c => c.id === fav.categoryId);
                                    return (
                                        <div
                                            key={fav.id}
                                            onClick={() => fav.placeId && setActiveFavDetails(fav)}
                                            className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between relative group overflow-hidden cursor-pointer"
                                            style={{ borderLeft: `5px solid ${cat?.color || '#e5e7eb'}` }}
                                        >
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-extrabold text-gray-800 text-sm md:text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                        {fav.name}
                                                    </h3>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm(`Supprimer ${fav.name} des favoris ?`)) {
                                                                deleteFavorite(fav.id);
                                                            }
                                                        }}
                                                        className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 md:opacity-0 group-hover:opacity-100 shrink-0"
                                                        title="Supprimer le favori"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2 mt-1 min-h-[32px]">{fav.address}</p>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between border-t pt-2.5">
                                                {cat ? (
                                                    <span
                                                        className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase"
                                                        style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                                                    >
                                                        {cat.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 font-medium">Sans catégorie</span>
                                                )}
                                                
                                                <div className="flex items-center gap-2">
                                                    {fav.durationMinutes && (
                                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                                            ⏱️ {fav.durationMinutes}m
                                                        </span>
                                                    )}
                                                    {fav.budget > 0 && (
                                                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                                            💶 {fav.budget}€
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Détails riches de lieu sur la page d'accueil */}
            {activeFavDetails && (
                <PlaceDetailsModal 
                    place={activeFavDetails} 
                    onClose={() => setActiveFavDetails(null)} 
                />
            )}
        </div>
    );
}</div>
    );
}