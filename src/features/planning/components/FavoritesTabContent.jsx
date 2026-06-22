import { useState, useMemo } from 'react';
import { useDateStore } from '../store/useDateStore';
import FavoriteEditForm from './FavoriteEditForm';

export default function FavoritesTabContent({ showToast }) {
    const { favorites = [], categories = [], addCategory, deleteCategory, deleteFavorite, addBlock, blocks, activeScenarioId } = useDateStore();
    const activeBlocks = blocks.filter(b => b.scenarioId === activeScenarioId);
    const [filterCatId, setFilterCatId] = useState(null);
    const [editingFavId, setEditingFavId] = useState(null);
    const [newCatName, setNewCatName] = useState('');
    const [isAddingCat, setIsAddingCat] = useState(false);

    const filtered = useMemo(() => filterCatId ? favorites.filter(f => f.categoryId === filterCatId) : favorites, [favorites, filterCatId]);

    const handleAdd = (fav) => {
        if (activeBlocks.some(b => b.placeId === fav.placeId) && !window.confirm(`"${fav.name}" est déjà présent. L'ajouter en double ?`)) return;
        addBlock(fav);
        showToast(`"${fav.name}" ajouté`);
    };

    const handleCreateCat = (e) => {
        e.preventDefault();
        if (newCatName.trim()) {
            addCategory(newCatName.trim());
            setNewCatName('');
            setIsAddingCat(false);
            showToast(`Catégorie "${newCatName.trim()}" créée`);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-4 no-scrollbar">
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Catégories</span>
                    <button onClick={() => setIsAddingCat(!isAddingCat)} className="text-blue-600 p-1 font-bold">+</button>
                </div>
                {isAddingCat && (
                    <form onSubmit={handleCreateCat} className="flex gap-2 p-1">
                        <input autoFocus value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Nom..." className="flex-1 px-2 py-1 text-xs border rounded-lg" />
                        <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-bold">OK</button>
                    </form>
                )}
                <div className="flex flex-wrap gap-2 px-1">
                    <button onClick={() => setFilterCatId(null)} className={`px-2.5 py-1 rounded-full border text-[10px] font-extrabold ${!filterCatId ? 'bg-blue-600 text-white' : 'bg-white text-gray-550'}`}>Tous</button>
                    {categories.map(cat => (
                        <div key={cat.id} onClick={() => setFilterCatId(filterCatId === cat.id ? null : cat.id)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-extrabold cursor-pointer" style={{ borderColor: cat.color, color: filterCatId === cat.id ? '#fff' : cat.color, backgroundColor: filterCatId === cat.id ? cat.color : `${cat.color}10` }}>
                            {cat.name}
                            <button onClick={(e) => { e.stopPropagation(); if (window.confirm("Supprimer ?")) { deleteCategory(cat.id); if (filterCatId === cat.id) setFilterCatId(null); } }} className="text-red-500 font-bold ml-1">✕</button>
                        </div>
                    ))}
                </div>
            </div>
            {filtered.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center p-8">Aucun favori.</div>
            ) : (
                <div className="flex flex-col gap-2">
                    {filtered.map(fav => (
                        <div key={fav.id} className="bg-white border rounded-xl p-3 shadow-sm" style={{ borderLeftWidth: '4px', borderLeftColor: categories.find(c => c.id === fav.categoryId)?.color || '#e5e7eb' }}>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 overflow-hidden cursor-pointer" onClick={() => editingFavId !== fav.id && handleAdd(fav)}>
                                    <p className="font-bold text-gray-800 text-sm truncate">{fav.name}</p>
                                    <p className="text-xs text-gray-505 truncate">{fav.address}</p>
                                </div>
                                <div className="flex gap-0.5">
                                    <button onClick={() => setEditingFavId(editingFavId === fav.id ? null : fav.id)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center" title="Modifier">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                    </button>
                                    <button onClick={() => window.confirm("Supprimer ?") && deleteFavorite(fav.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center" title="Supprimer">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </button>
                                </div>
                            </div>
                            {editingFavId === fav.id && <FavoriteEditForm fav={fav} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
