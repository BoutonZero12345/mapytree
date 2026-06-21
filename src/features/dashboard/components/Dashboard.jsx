import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDateStore } from '../../planning/store/useDateStore';
import PlanCard from './PlanCard';
import PlaceDetailsModal from '../../planning/components/PlaceDetailsModal';

export default function Dashboard() {
    const navigate = useNavigate();

    // --- ZUSTAND STORE BINDINGS ---
    const dates = useDateStore((state) => state.dates || []);
    const loadDates = useDateStore((state) => state.loadDates);
    const createDatePlanning = useDateStore((state) => state.createDatePlanning);
    const deleteDatePlanning = useDateStore((state) => state.deleteDatePlanning);
    const updateDatePlanningName = useDateStore((state) => state.updateDatePlanningName);

    const folders = useDateStore((state) => state.folders || []);
    const loadFolders = useDateStore((state) => state.loadFolders);
    const createFolder = useDateStore((state) => state.createFolder);
    const updateFolderState = useDateStore((state) => state.updateFolderState);
    const deleteFolderState = useDateStore((state) => state.deleteFolderState);
    const updateDateFolder = useDateStore((state) => state.updateDateFolder);

    const favorites = useDateStore((state) => state.favorites || []);
    const categories = useDateStore((state) => state.categories || []);
    const loadFavorites = useDateStore((state) => state.loadFavorites);
    const addCategory = useDateStore((state) => state.addCategory);
    const updateCategory = useDateStore((state) => state.updateCategory);
    const deleteCategory = useDateStore((state) => state.deleteCategory);
    const updateFavorite = useDateStore((state) => state.updateFavorite);
    const deleteFavorite = useDateStore((state) => state.deleteFavorite);

    const isLoadingDates = useDateStore((state) => state.isLoadingDates);
    const isLoadingFolders = useDateStore((state) => state.isLoadingFolders);
    const isLoadingFavorites = useDateStore((state) => state.isLoadingFavorites);

    // --- LOCAL STATES ---
    const [activeTab, setActiveTab] = useState('plans'); // 'plans' ou 'favorites'
    const [currentFolderId, setCurrentFolderId] = useState(null); // navigation dossiers
    const [activeFavDetails, setActiveFavDetails] = useState(null); // PlaceDetailsModal

    // Gestion Dossiers
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderColor, setNewFolderColor] = useState('#3b82f6');
    const [editingFolder, setEditingFolder] = useState(null);
    const [editFolderName, setEditFolderName] = useState('');
    const [editFolderColor, setEditFolderColor] = useState('');
    const [editFolderParentId, setEditFolderParentId] = useState('');
    const [dragOverFolderId, setDragOverFolderId] = useState(null);
    const [isDragOverRoot, setIsDragOverRoot] = useState(false);

    // Gestion Catégories de Favoris
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [editCategoryColor, setEditCategoryColor] = useState('');

    // Gestion Édition de Favoris
    const [editingFavorite, setEditingFavorite] = useState(null);
    const [editFavName, setEditFavName] = useState('');
    const [editFavCategoryId, setEditFavCategoryId] = useState('');
    const [editFavDuration, setEditFavDuration] = useState(60);
    const [editFavBudget, setEditFavBudget] = useState(0);

    // Pre-load data from DB
    useEffect(() => {
        loadDates();
        loadFolders();
        loadFavorites();
    }, [loadDates, loadFolders, loadFavorites]);

    // --- INSTANT PLANNING CREATION ---
    const handleCreateInstant = async () => {
        let name = "Nouveau planning";
        let counter = 2;
        while (dates.some(d => d.name === name)) {
            name = `Nouveau planning ${counter}`;
            counter++;
        }
        const newDate = await createDatePlanning(name);
        if (newDate) {
            navigate(`/plan/${newDate.id}`);
        }
    };

    // --- BREADCRUMBS CALCULATION ---
    const getBreadcrumbs = () => {
        const crumbs = [];
        let current = folders.find(f => f.id === currentFolderId);
        while (current) {
            crumbs.unshift(current);
            current = folders.find(f => f.id === current.parentFolderId);
        }
        return crumbs;
    };

    // --- FOLDER CYCLE CHECK ---
    const isDescendant = (childId, parentId) => {
        if (childId === parentId) return true;
        let current = folders.find(f => f.id === childId);
        while (current) {
            if (current.parentFolderId === parentId) return true;
            current = folders.find(f => f.id === current.parentFolderId);
        }
        return false;
    };

    // --- DRAG AND DROP ACTIONS ---
    const handleDropOnFolder = (e, targetFolderId) => {
        e.preventDefault();
        setDragOverFolderId(null);
        const draggedPlanningId = e.dataTransfer.getData('text/planningId');
        const draggedFolderId = e.dataTransfer.getData('text/folderId');
        
        if (draggedPlanningId) {
            updateDateFolder(draggedPlanningId, targetFolderId);
        } else if (draggedFolderId && draggedFolderId !== targetFolderId) {
            if (!isDescendant(targetFolderId, draggedFolderId)) {
                updateFolderState(draggedFolderId, { parentFolderId: targetFolderId });
            } else {
                alert("Erreur: Un dossier parent ne peut pas être déplacé dans un de ses sous-dossiers !");
            }
        }
    };

    const handleDropOnRootOrCrumb = (e, targetFolderId) => {
        e.preventDefault();
        setIsDragOverRoot(false);
        const draggedPlanningId = e.dataTransfer.getData('text/planningId');
        const draggedFolderId = e.dataTransfer.getData('text/folderId');
        
        if (draggedPlanningId) {
            updateDateFolder(draggedPlanningId, targetFolderId);
        } else if (draggedFolderId) {
            if (targetFolderId === null || !isDescendant(targetFolderId, draggedFolderId)) {
                updateFolderState(draggedFolderId, { parentFolderId: targetFolderId });
            } else {
                alert("Erreur: Déplacement cyclique interdit !");
            }
        }
    };

    // --- RENDER PARTS ---
    const filteredFolders = folders.filter(f => f.parentFolderId === currentFolderId);
    const filteredPlannings = dates.filter(d => (d.folderId || null) === currentFolderId);

    // Top 3 plannings plus récents
    const recentPlannings = [...dates]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 3);

    // Filtre des favoris
    const filteredFavorites = selectedCategoryId
        ? favorites.filter(f => f.categoryId === selectedCategoryId)
        : favorites;

    return (
        <div className="min-h-[100dvh] bg-gradient-to-tr from-slate-50 via-gray-50 to-blue-50/30 p-4 md:p-6 flex flex-col items-center">
            <div className="max-w-3xl w-full mt-4 md:mt-8">
                
                {/* LOGO ET TITRE PREMIUM */}
                <div className="flex flex-col items-center mb-6 md:mb-8">
                    <div className="flex items-center gap-3">
                        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-600 drop-shadow-md">
                            <path d="M12 2L2 22h20L12 2z" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="3.5" fill="currentColor" className="text-indigo-600" />
                            <path d="M12 2v10M2 22l10-10M22 22L12 12" />
                        </svg>
                        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent tracking-tight">
                            Mapytree
                        </h1>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 font-bold mt-2">Planificateur d'itinéraires et de plannings haut de gamme</p>
                </div>

                {/* BOUTONS ACTIONS PRINCIPALES */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        onClick={handleCreateInstant}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-750 hover:to-indigo-750 text-white p-4 rounded-2xl font-extrabold flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/20 active:scale-[0.99] transition-all text-sm md:text-base border border-blue-700/20"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Nouveau planning
                    </button>
                    
                    <button
                        onClick={() => setIsCreatingFolder(true)}
                        className="bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 p-4 rounded-2xl font-extrabold flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.99] transition-all text-sm md:text-base"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
                        Nouveau dossier
                    </button>
                </div>

                {/* INLINE FOLDER CREATOR CARD */}
                {isCreatingFolder && (
                    <div className="bg-white p-5 rounded-2xl border border-blue-150 shadow-md mb-6 animate-in slide-in-from-top-4 duration-200">
                        <h4 className="text-sm font-black text-gray-800 mb-3">Créer un nouveau dossier</h4>
                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="Nom du dossier..."
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                                autoFocus
                            />
                            
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Couleur du dossier</label>
                                <div className="flex flex-wrap gap-2">
                                    {['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#64748b', '#1e293b'].map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setNewFolderColor(c)}
                                            className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 shrink-0 ${newFolderColor === c ? 'border-black scale-110 shadow-sm' : 'border-transparent'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={async () => {
                                        if (newFolderName.trim()) {
                                            await createFolder(newFolderName.trim(), newFolderColor, currentFolderId);
                                            setNewFolderName('');
                                            setIsCreatingFolder(false);
                                        }
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-colors"
                                >
                                    Créer le dossier
                                </button>
                                <button
                                    onClick={() => setIsCreatingFolder(false)}
                                    className="bg-gray-150 hover:bg-gray-250 text-gray-650 text-xs font-extrabold px-4 py-2 rounded-xl transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* SWITCHER D'ONGLETS ACCUEIL */}
                <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 shadow-inner">
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`flex-1 py-3 px-4 text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'plans'
                                ? 'bg-white text-blue-650 shadow-md'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                        }`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Mes Plannings ({dates.length})
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

                {/* --- CONTENU ONGLET PLANNINGS (AVEC DOSSIERS & RÉCENTS) --- */}
                {activeTab === 'plans' ? (
                    <div className="space-y-6">
                        
                        {/* 1. TOP 3 PLANNINGS RÉCENTS (Uniquement à la racine) */}
                        {currentFolderId === null && dates.length > 0 && (
                            <div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-500"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    Plannings Modifiés Récemment
                                </h3>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {recentPlannings.map(date => (
                                        <div
                                            key={`recent-${date.id}`}
                                            onClick={() => navigate(`/plan/${date.id}`)}
                                            className="bg-white/60 backdrop-blur-xs p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-blue-500 hover:scale-[1.02] cursor-pointer transition-all flex flex-col justify-between group h-28"
                                        >
                                            <h4 className="font-extrabold text-gray-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {date.name}
                                            </h4>
                                            <span className="text-[10px] text-gray-400 font-bold">
                                                {date.updatedAt ? (
                                                    `Modifié le ${new Date(date.updatedAt).toLocaleDateString('fr-FR')}`
                                                ) : (
                                                    `Créé le ${new Date(date.createdAt).toLocaleDateString('fr-FR')}`
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* NAV DOSSIERS : BREADCRUMBS & COMPTEUR */}
                        <div 
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragOverRoot(true);
                            }}
                            onDragLeave={() => setIsDragOverRoot(false)}
                            onDrop={(e) => handleDropOnRootOrCrumb(e, currentFolderId)}
                            className={`flex flex-wrap items-center justify-between gap-2 bg-slate-100/60 p-3 rounded-2xl border transition-all ${
                                isDragOverRoot ? 'bg-blue-50/50 border-blue-500 scale-[1.01] border-dashed shadow-xs' : 'border-gray-200/50'
                            }`}
                        >
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                {/* Root Crumb Link */}
                                <button 
                                    onClick={() => setCurrentFolderId(null)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => handleDropOnRootOrCrumb(e, null)}
                                    className={`hover:text-blue-600 flex items-center gap-1 ${currentFolderId === null ? 'text-gray-800 font-black' : ''}`}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                    Accueil
                                </button>
                                
                                {getBreadcrumbs().map((crumb) => (
                                    <div key={crumb.id} className="flex items-center gap-1">
                                        <span className="text-gray-400">/</span>
                                        <button 
                                            onClick={() => setCurrentFolderId(crumb.id)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => handleDropOnRootOrCrumb(e, crumb.id)}
                                            className={`hover:text-blue-600 truncate max-w-[120px] ${crumb.id === currentFolderId ? 'text-gray-800 font-black' : ''}`}
                                            style={{ color: crumb.id === currentFolderId ? crumb.color : undefined }}
                                        >
                                            {crumb.name}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Info dossier actuel ou retour parent */}
                            {currentFolderId !== null && (
                                <button
                                    onClick={() => {
                                        const currentFolder = folders.find(f => f.id === currentFolderId);
                                        setCurrentFolderId(currentFolder?.parentFolderId || null);
                                    }}
                                    className="text-[10px] bg-white border border-gray-250 font-black text-gray-500 px-2 py-0.5 rounded-full hover:bg-gray-150 transition-colors flex items-center gap-1 shrink-0"
                                >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                    Retour
                                </button>
                            )}
                        </div>

                        {/* LISTING DOSSIERS ET PLANNINGS */}
                        {isLoadingDates || isLoadingFolders ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                <p className="text-gray-500 text-sm">Chargement de vos fichiers...</p>
                            </div>
                        ) : filteredFolders.length === 0 && filteredPlannings.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 border-dashed p-6">
                                <p className="text-gray-500 text-sm font-semibold">Ce dossier est vide.</p>
                                <p className="text-xs text-gray-400 mt-1">Glissez-déposez des plannings ou des dossiers à l'intérieur !</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                
                                {/* 2. GRILLE DES DOSSIERS TRANSPARENTS AVEC BORDURES COLORÉES */}
                                {filteredFolders.length > 0 && (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {filteredFolders.map(folder => (
                                            <div
                                                key={folder.id}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData('text/folderId', folder.id);
                                                    e.dataTransfer.effectAllowed = 'move';
                                                }}
                                                onDragEnter={(e) => { e.preventDefault(); setDragOverFolderId(folder.id); }}
                                                onDragLeave={() => setDragOverFolderId(null)}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => handleDropOnFolder(e, folder.id)}
                                                onClick={() => setCurrentFolderId(folder.id)}
                                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center group bg-white/20 hover:bg-white/40 shadow-xs cursor-grab active:cursor-grabbing ${
                                                    dragOverFolderId === folder.id 
                                                        ? 'bg-blue-50/50 scale-[1.02] border-solid shadow-md' 
                                                        : 'border-dashed'
                                                }`}
                                                style={{ borderColor: folder.color || '#3b82f6' }}
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: folder.color || '#3b82f6' }} className="shrink-0 drop-shadow-xs">
                                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                                    </svg>
                                                    <span className="font-extrabold text-sm text-gray-800 truncate">
                                                        {folder.name}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex gap-1 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingFolder(folder);
                                                            setEditFolderName(folder.name);
                                                            setEditFolderColor(folder.color || '#3b82f6');
                                                            setEditFolderParentId(folder.parentFolderId || '');
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-white shadow-xs border border-transparent hover:border-gray-150 transition-all bg-white/50"
                                                        title="Modifier le dossier"
                                                    >
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                                    </button>
                                                    
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm(`Supprimer le dossier "${folder.name}" ? Les plannings à l'intérieur ne seront pas supprimés mais déplacés à la racine.`)) {
                                                                await deleteFolderState(folder.id);
                                                            }
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-white shadow-xs border border-transparent hover:border-gray-150 transition-all bg-white/50"
                                                        title="Supprimer le dossier"
                                                    >
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* LISTE DES PLANNINGS DANS CE DOSSIER */}
                                {filteredPlannings.length > 0 && (
                                    <div className="grid gap-3">
                                        {filteredPlannings.map(date => (
                                            <PlanCard
                                                key={date.id}
                                                date={date}
                                                onClick={(id) => navigate(`/plan/${id}`)}
                                                onDelete={deleteDatePlanning}
                                                onSaveEdit={updateDatePlanningName}
                                            />
                                        ))}
                                    </div>
                                )}

                            </div>
                        )}
                    </div>
                ) : (
                    
                    // --- CONTENU ONGLET FAVORIS (GESTION COMPLÈTE & FILTRAGE) ---
                    <div className="space-y-5 animate-in fade-in duration-200">
                        
                        {/* A. HORIZONTAL CATEGORY SELECTOR / CRUD */}
                        <div className="bg-white/60 backdrop-blur-xs p-4 rounded-3xl border border-gray-250/70 shadow-xs">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Filtrer par Catégorie</h3>
                                <button
                                    onClick={() => setIsAddingCategory(!isAddingCategory)}
                                    className="text-xs text-blue-600 font-extrabold flex items-center gap-1 hover:text-blue-800 transition-colors"
                                    title="Ajouter une nouvelle catégorie"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    Ajouter
                                </button>
                            </div>

                            {/* Formulaire ajout catégorie inline */}
                            {isAddingCategory && (
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (newCategoryName.trim()) {
                                            await addCategory(newCategoryName.trim());
                                            setNewCategoryName('');
                                            setIsAddingCategory(false);
                                        }
                                    }}
                                    className="flex gap-2 mb-3.5 animate-in slide-in-from-top-2 duration-150"
                                >
                                    <input
                                        type="text"
                                        placeholder="Nom de catégorie..."
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-blue-500 font-semibold"
                                        autoFocus
                                    />
                                    <button type="submit" className="bg-blue-600 text-white text-xs font-black px-3 py-1.5 rounded-xl hover:bg-blue-700">✓</button>
                                    <button type="button" onClick={() => setIsAddingCategory(false)} className="bg-gray-200 text-gray-600 text-xs font-black px-3 py-1.5 rounded-xl">✕</button>
                                </form>
                            )}

                            {/* Liste horizontale des tags de catégorie avec boutons crayon/croix */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <button
                                    onClick={() => setSelectedCategoryId(null)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-extrabold tracking-wider transition-all select-none ${
                                        selectedCategoryId === null
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    Tous
                                </button>

                                {categories.map(cat => {
                                    const isActive = selectedCategoryId === cat.id;
                                    return (
                                        <div
                                            key={cat.id}
                                            className={`flex items-center rounded-full text-xs font-extrabold tracking-wider transition-all group overflow-hidden border ${
                                                isActive
                                                    ? 'text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                            style={{
                                                backgroundColor: isActive ? cat.color : undefined,
                                                borderColor: cat.color
                                            }}
                                        >
                                            {/* Tag text link click to select */}
                                            <button
                                                onClick={() => setSelectedCategoryId(isActive ? null : cat.id)}
                                                className="px-3 py-1.5 font-bold"
                                            >
                                                {cat.name}
                                            </button>

                                            {/* Category Edit/Delete operations */}
                                            <div className="flex items-center pr-1.5 gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingCategory(cat);
                                                        setEditCategoryName(cat.name);
                                                        setEditCategoryColor(cat.color || '#3b82f6');
                                                    }}
                                                    className={`p-0.5 rounded-full hover:bg-black/10 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 hover:text-blue-500'}`}
                                                    title="Modifier la catégorie"
                                                >
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                                </button>
                                                
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm(`Supprimer la catégorie "${cat.name}" ? Les favoris associés ne seront pas supprimés.`)) {
                                                            await deleteCategory(cat.id);
                                                            if (selectedCategoryId === cat.id) setSelectedCategoryId(null);
                                                        }
                                                    }}
                                                    className={`p-0.5 rounded-full hover:bg-black/10 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 hover:text-red-500'}`}
                                                    title="Supprimer la catégorie"
                                                >
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* B. LISTING DES FAVORIS AVEC ÉDITION AU CRAYON */}
                        {isLoadingFavorites ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mb-2"></div>
                                <p className="text-gray-500 text-sm">Chargement des favoris...</p>
                            </div>
                        ) : filteredFavorites.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 border-dashed p-6 flex flex-col items-center">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300 mb-2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <p className="text-gray-500 text-sm font-semibold">Aucun favori dans cette catégorie.</p>
                                <p className="text-xs text-gray-400 mt-1">Ajoutez des favoris depuis les plans pour les voir apparaître ici !</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {filteredFavorites.map(fav => {
                                    const cat = categories.find(c => c.id === fav.categoryId);
                                    return (
                                        <div
                                            key={fav.id}
                                            onClick={() => fav.placeId && setActiveFavDetails(fav)}
                                            className="bg-white p-4 rounded-2xl border border-gray-250 shadow-xs hover:shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between relative group overflow-hidden cursor-pointer"
                                            style={{ borderLeft: `5px solid ${cat?.color || '#e5e7eb'}` }}
                                        >
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-extrabold text-gray-800 text-sm md:text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                        {fav.name}
                                                    </h3>
                                                    
                                                    {/* BOUTONS ACTIONS FAVORIS (Crayon / Corbeille) */}
                                                    <div className="flex gap-0.5 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingFavorite(fav);
                                                                setEditFavName(fav.name);
                                                                setEditFavCategoryId(fav.categoryId || '');
                                                                setEditFavDuration(fav.durationMinutes ?? 60);
                                                                setEditFavBudget(fav.budget ?? 0);
                                                            }}
                                                            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 rounded-full hover:bg-blue-50"
                                                            title="Modifier le favori"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                                        </button>
                                                        
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm(`Supprimer "${fav.name}" des favoris ?`)) {
                                                                    deleteFavorite(fav.id);
                                                                }
                                                            }}
                                                            className="text-gray-300 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-55"
                                                            title="Supprimer le favori"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2 mt-1 min-h-[32px]">{fav.address}</p>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between border-t pt-2.5">
                                                {cat ? (
                                                    <span
                                                        className="px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase"
                                                        style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                                                    >
                                                        {cat.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 font-bold italic">Sans catégorie</span>
                                                )}
                                                
                                                <div className="flex items-center gap-2">
                                                    {/* MASQUAGE DU 0m */}
                                                    {fav.durationMinutes && fav.durationMinutes !== 0 && fav.durationMinutes !== '0' && (
                                                        <span className="text-[10px] font-black text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.8 shadow-2xs border border-gray-200/40">
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-400"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                            {fav.durationMinutes}m
                                                        </span>
                                                    )}
                                                    {fav.budget > 0 && (
                                                        <span className="text-[10px] font-black text-green-700 bg-green-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.8 shadow-2xs border border-green-200/20">
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-500"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v12M12 10a2 2 0 1 0 0-4M12 18a2 2 0 1 1 0-4"></path></svg>
                                                            {fav.budget}€
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

            {/* --- MODAL IMAGE IMMERSIVE / DETAILS FAVORIS --- */}
            {activeFavDetails && (
                <PlaceDetailsModal 
                    place={activeFavDetails} 
                    onClose={() => setActiveFavDetails(null)} 
                />
            )}

            {/* --- MODAL ÉDITION DE FAVORIS --- */}
            {editingFavorite && (
                <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-150 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-500"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Éditer le favori
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Nom du favori</label>
                                <input
                                    type="text"
                                    value={editFavName}
                                    onChange={(e) => setEditFavName(e.target.value)}
                                    className="w-full mt-1 px-4 py-2 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                                />
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Catégorie du favori</label>
                                <select
                                    value={editFavCategoryId || ''}
                                    onChange={(e) => setEditFavCategoryId(e.target.value || '')}
                                    className="w-full mt-1 px-4 py-2 border border-gray-250 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                >
                                    <option value="">Sans catégorie</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Durée par défaut (m)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editFavDuration}
                                        onChange={(e) => setEditFavDuration(Number(e.target.value))}
                                        className="w-full mt-1 px-4 py-2 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-black"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Budget estimé (€)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editFavBudget}
                                        onChange={(e) => setEditFavBudget(Number(e.target.value))}
                                        className="w-full mt-1 px-4 py-2 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-black text-green-600"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2.5 mt-6">
                            <button
                                onClick={async () => {
                                    if (editFavName.trim()) {
                                        await updateFavorite(editingFavorite.id, {
                                            name: editFavName.trim(),
                                            categoryId: editFavCategoryId || null,
                                            durationMinutes: editFavDuration,
                                            budget: editFavBudget
                                        });
                                        setEditingFavorite(null);
                                    }
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-750 text-white font-extrabold py-3 px-4 rounded-xl transition-all shadow-sm"
                            >
                                Enregistrer
                            </button>
                            <button
                                onClick={() => setEditingFavorite(null)}
                                className="flex-1 bg-gray-150 hover:bg-gray-250 text-gray-600 font-extrabold py-3 px-4 rounded-xl transition-all"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL ÉDITION DE CATÉGORIES --- */}
            {editingCategory && (
                <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-150 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-500"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Modifier la catégorie
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Nom de la catégorie</label>
                                <input
                                    type="text"
                                    value={editCategoryName}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                    className="w-full mt-1 px-4 py-2 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                                />
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Couleur</label>
                                <div className="flex flex-wrap gap-2">
                                    {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'].map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setEditCategoryColor(c)}
                                            className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 shrink-0 ${editCategoryColor === c ? 'border-black scale-110 shadow-sm' : 'border-transparent'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2.5 mt-6">
                            <button
                                onClick={async () => {
                                    if (editCategoryName.trim()) {
                                        await updateCategory(editingCategory.id, {
                                            name: editCategoryName.trim(),
                                            color: editCategoryColor
                                        });
                                        setEditingCategory(null);
                                    }
                                }}
                                className="flex-1 bg-blue-650 hover:bg-blue-750 text-white font-extrabold py-3 px-4 rounded-xl transition-all shadow-sm"
                            >
                                Enregistrer
                            </button>
                            <button
                                onClick={() => setEditingCategory(null)}
                                className="flex-1 bg-gray-150 hover:bg-gray-250 text-gray-650 font-extrabold py-3 px-4 rounded-xl transition-all"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL ÉDITION DE DOSSIERS (AVEC PASCAL PARENT DEPENDANCE) --- */}
            {editingFolder && (
                <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-150 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-500"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                            Modifier le dossier
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Nom du dossier</label>
                                <input
                                    type="text"
                                    value={editFolderName}
                                    onChange={(e) => setEditFolderName(e.target.value)}
                                    className="w-full mt-1 px-4 py-2 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                                />
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Couleur</label>
                                <div className="flex flex-wrap gap-2">
                                    {['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#64748b', '#1e293b'].map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setEditFolderColor(c)}
                                            className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 shrink-0 ${editFolderColor === c ? 'border-black scale-110 shadow-sm' : 'border-transparent'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Dossier parent (Dépendance)</label>
                                <select
                                    value={editFolderParentId || ''}
                                    onChange={(e) => setEditFolderParentId(e.target.value || '')}
                                    className="w-full mt-1 px-4 py-2 border border-gray-250 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                >
                                    <option value="">Racine (aucun)</option>
                                    {folders
                                        .filter(f => f.id !== editingFolder.id && !isDescendant(f.id, editingFolder.id))
                                        .map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex gap-2.5 mt-6">
                            <button
                                onClick={async () => {
                                    if (editFolderName.trim()) {
                                        await updateFolderState(editingFolder.id, {
                                            name: editFolderName.trim(),
                                            color: editFolderColor,
                                            parentFolderId: editFolderParentId || null
                                        });
                                        setEditingFolder(null);
                                    }
                                }}
                                className="flex-1 bg-blue-650 hover:bg-blue-755 text-white font-extrabold py-3 px-4 rounded-xl transition-all shadow-sm"
                            >
                                Enregistrer
                            </button>
                            <button
                                onClick={() => setEditingFolder(null)}
                                className="flex-1 bg-gray-150 hover:bg-gray-255 text-gray-650 font-extrabold py-3 px-4 rounded-xl transition-all"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}