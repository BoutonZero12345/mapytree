import { useState, useMemo } from 'react';
import { useDateStore } from '../store/useDateStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ScenarioTabs from './ScenarioTabs';
import SortableBlock from './SortableBlock';

export default function Timeline() {
    const blocks = useDateStore((state) => state.blocks);
    const activeScenarioId = useDateStore((state) => state.activeScenarioId);
    const addGenericEvent = useDateStore((state) => state.addGenericEvent);
    const addBlock = useDateStore((state) => state.addBlock);
    const favorites = useDateStore((state) => state.favorites);
    const categories = useDateStore((state) => state.categories);
    const addCategory = useDateStore((state) => state.addCategory);
    const deleteCategory = useDateStore((state) => state.deleteCategory);
    const updateFavorite = useDateStore((state) => state.updateFavorite);
    const deleteFavorite = useDateStore((state) => state.deleteFavorite);
    const travelInfos = useDateStore((state) => state.travelInfos);
    const saveToDb = useDateStore((state) => state.saveToDb);
    const isSaving = useDateStore((state) => state.isSaving);
    const reorderBlocks = useDateStore((state) => state.reorderBlocks); // Fix: import reorderBlocks
    const startTime = useDateStore((state) => state.startTime); // NOUVEAU: destructure startTime

    const [activeTab, setActiveTab] = useState('plan'); // 'plan' ou 'favorites'
    const [editingFavId, setEditingFavId] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isFooterCollapsed, setIsFooterCollapsed] = useState(true); // Gère l'état compact du budget

    const activeBlocks = blocks.filter(b => b.scenarioId === activeScenarioId);
    const totalBudget = activeBlocks.reduce((sum, block) => sum + (Number(block.budget) || 0), 0);

    const parseTravelTime = (durationText) => {
        if (!durationText) return 0;
        let totalMinutes = 0;
        const hoursMatch = durationText.match(/(\d+)\s*(h|heure|hour)/i);
        const minsMatch = durationText.match(/(\d+)\s*(m|min)/i);
        if (hoursMatch) totalMinutes += parseInt(hoursMatch[1], 10) * 60;
        if (minsMatch) totalMinutes += parseInt(minsMatch[1], 10);
        return totalMinutes;
    };

    // NOUVEAU: Calcule l'horaire de passage de chaque bloc
    const activeBlocksWithTimes = useMemo(() => {
        const [startH, startM] = startTime.split(':').map(Number);
        let currentMinutes = startH * 60 + startM;
        
        return activeBlocks.map((block, index) => {
            if (block.fixedStartTime) {
                const [fH, fM] = block.fixedStartTime.split(':').map(Number);
                currentMinutes = fH * 60 + fM;
            }
            
            const timeStr = `${Math.floor(currentMinutes / 60) % 24}:${(currentMinutes % 60).toString().padStart(2, '0')}`;
            
            // Avancement pour le prochain bloc
            const locationDuration = Number(block.durationMinutes) || 0;
            currentMinutes += locationDuration;
            
            if (index < activeBlocks.length - 1 && travelInfos[index]) {
                const travelMinutes = parseTravelTime(travelInfos[index].duration);
                currentMinutes += travelMinutes;
            }
            
            return {
                ...block,
                scheduledStartTime: timeStr
            };
        });
    }, [activeBlocks, travelInfos, startTime]);

    const totalDurationMinutes = activeBlocks.reduce((sum, block, index) => {
        let blockMins = Number(block.durationMinutes) || 0;
        let travelMins = 0;
        if (index < activeBlocks.length - 1 && travelInfos[index]) {
            travelMins = parseTravelTime(travelInfos[index].duration);
        }
        return sum + blockMins + travelMins;
    }, 0);

    const formatDuration = (totalMins) => {
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        if (h > 0) {
            return `${h}h${m > 0 ? ` ${m}m` : ''}`;
        }
        return `${m} min`;
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            reorderBlocks(active.id, over.id);
        }
    };

    const handleAddCategory = (e) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            addCategory(newCategoryName.trim());
            setNewCategoryName('');
            setIsAddingCategory(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">

            {/* 1. Les onglets des variantes */}
            <ScenarioTabs />

            {/* Switcher Plan / Favoris & Bouton "+" épuré */}
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
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </button>
                </div>
                {activeTab === 'plan' && (
                    <button
                        onClick={addGenericEvent}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all font-bold flex items-center justify-center border border-blue-100 hover:scale-105 shrink-0 shadow-sm"
                        title="Ajouter un événement vide"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                )}
            </div>

            {activeTab === 'plan' ? (
                <>
                    {/* 2. La liste des lieux (Drag & Drop) */}
                    {activeBlocks.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center space-y-4 p-4">
                            <p className="text-base font-semibold">Ce scénario est vide.</p>
                            <p className="text-xs text-gray-400">Ajoute des lieux via la carte ou tes favoris en cliquant sur le bouton '+' ou en recherchant.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-4 no-scrollbar">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={activeBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                    {activeBlocksWithTimes.map((block, index) => (
                                        <SortableBlock
                                            key={block.id}
                                            block={block}
                                            index={index}
                                            travelInfo={travelInfos[index]}
                                            scheduledStartTime={block.scheduledStartTime}
                                            isLast={index === activeBlocks.length - 1}
                                            nextBlockId={activeBlocks[index + 1]?.id}
                                            nextBlockMode={activeBlocks[index + 1]?.travelMode || 'DRIVING'}
                                            nextBlockRouteIndex={activeBlocks[index + 1]?.selectedRouteIndex || 0}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-4 no-scrollbar">
                    {/* Gestion des Catégories */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Catégories</h3>
                            <button 
                                onClick={() => setIsAddingCategory(!isAddingCategory)}
                                className="text-blue-600 hover:text-blue-700"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                        </div>

                        {isAddingCategory && (
                            <form onSubmit={handleAddCategory} className="flex gap-2 p-1">
                                <input 
                                    autoFocus
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Nom..."
                                    className="flex-1 px-2 py-1 text-xs border rounded-lg outline-none focus:border-blue-500"
                                />
                                <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-bold">OK</button>
                            </form>
                        )}

                        <div className="flex flex-wrap gap-2 px-1">
                            {categories.map(cat => (
                                <div 
                                    key={cat.id}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold transition-all group"
                                    style={{ borderColor: cat.color, color: cat.color, backgroundColor: `${cat.color}10` }}
                                >
                                    {cat.name}
                                    <button 
                                        onClick={() => window.confirm(`Supprimer la catégorie "${cat.name}" ?`) && deleteCategory(cat.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                    >
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 mx-1"></div>

                    {/* Liste des Favoris */}
                    {favorites.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center p-8">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 opacity-20"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            <p className="text-sm font-medium">Aucun lieu favori.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {favorites.map(fav => {
                                const cat = categories.find(c => c.id === fav.categoryId);
                                const isEditing = editingFavId === fav.id;

                                return (
                                    <div
                                        key={fav.id}
                                        className={`bg-white border rounded-xl p-3 shadow-sm transition-all group relative ${isEditing ? 'ring-2 ring-blue-500' : 'hover:border-yellow-400'}`}
                                        style={{ borderLeftWidth: '4px', borderLeftColor: cat?.color || '#e5e7eb' }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="flex-1 overflow-hidden cursor-pointer"
                                                onClick={() => { if(!isEditing) { addBlock(fav); } }}
                                            >
                                                <p className="font-bold text-gray-800 text-sm truncate">{fav.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{fav.address}</p>
                                            </div>
                                            
                                            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => setEditingFavId(isEditing ? null : fav.id)}
                                                    className={`p-1 rounded-md transition-colors ${isEditing ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                                <button 
                                                    onClick={() => window.confirm("Supprimer ce favori ?") && deleteFavorite(fav.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                </button>
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="mt-3 pt-3 border-t flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Nom du lieu</span>
                                                    <input 
                                                        type="text" 
                                                        value={fav.name} 
                                                        onChange={(e) => updateFavorite(fav.id, { name: e.target.value })}
                                                        className="w-full text-xs font-bold bg-gray-50 border-none rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-2">
                                                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                                                        <span className="text-xs">⏱️</span>
                                                        <input 
                                                            type="number" 
                                                            value={fav.durationMinutes || 0} 
                                                            onChange={(e) => updateFavorite(fav.id, { durationMinutes: Number(e.target.value) })}
                                                            className="w-12 bg-transparent text-xs font-bold outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                                                        <span className="text-xs">💶</span>
                                                        <input 
                                                            type="number" 
                                                            value={fav.budget || 0} 
                                                            onChange={(e) => updateFavorite(fav.id, { budget: Number(e.target.value) })}
                                                            className="w-12 bg-transparent text-xs font-bold outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <select 
                                                    value={fav.categoryId || ''} 
                                                    onChange={(e) => updateFavorite(fav.id, { categoryId: e.target.value || null })}
                                                    className="w-full text-xs font-bold bg-gray-50 border-none rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="">Aucune catégorie</option>
                                                    {categories.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>

                                                <textarea 
                                                    value={fav.notes || ''} 
                                                    onChange={(e) => updateFavorite(fav.id, { notes: e.target.value })}
                                                    placeholder="Notes..."
                                                    className="w-full text-xs bg-gray-50 border-none rounded-lg px-3 py-2 h-16 resize-none outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* 3. Le Footer Rétractable & Optimisé */}
            <div className="pt-2 border-t mt-auto flex flex-col gap-2 shrink-0 bg-white md:p-3">
                {activeBlocks.length > 0 && (
                    <div className="px-1 transition-all duration-300">
                        {isFooterCollapsed ? (
                            <div 
                                onClick={() => setIsFooterCollapsed(false)}
                                className="flex justify-between items-center py-1.5 px-3 bg-gray-50 hover:bg-gray-100/80 rounded-xl cursor-pointer border border-gray-150/50 shadow-sm transition-all"
                            >
                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                    <span className="flex items-center gap-1">⏱️ <strong className="text-gray-800 font-extrabold">{formatDuration(totalDurationMinutes)}</strong></span>
                                    <span className="text-gray-300">|</span>
                                    <span className="flex items-center gap-1">💶 <strong className="text-gray-850 font-extrabold">{totalBudget} €</strong></span>
                                </div>
                                <span className="text-[10px] text-blue-600 font-extrabold hover:underline flex items-center gap-0.5">
                                    Détails
                                    <svg className="w-2.5 h-2.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </span>
                            </div>
                        ) : (
                            <div 
                                onClick={() => setIsFooterCollapsed(true)}
                                className="flex flex-col gap-2 p-3 bg-gray-50 hover:bg-gray-100/50 rounded-xl cursor-pointer border border-gray-200 transition-all shadow-sm"
                            >
                                <div className="flex justify-between items-center border-b pb-1.5 mb-1">
                                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Résumé de la journée</span>
                                    <span className="text-[9px] text-gray-400 font-bold flex items-center gap-0.5">
                                        Réduire
                                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-medium">Durée totale cumulée :</span>
                                    <span className="font-extrabold text-gray-800">{formatDuration(totalDurationMinutes)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-medium">Budget total estimé :</span>
                                    <span className="font-extrabold text-blue-600">{totalBudget} €</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <button
                    onClick={saveToDb}
                    disabled={isSaving || activeBlocks.length === 0}
                    className="w-full bg-blue-600 text-white py-2.5 md:py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm text-sm"
                >
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder le projet'}
                </button>
            </div>

        </div>
    );
}