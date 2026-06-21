import { useDateStore } from '../store/useDateStore';

export default function FavoriteEditForm({ fav }) {
    const updateFavorite = useDateStore(s => s.updateFavorite);
    const categories = useDateStore(s => s.categories || []);

    return (
        <div className="mt-3 pt-3 border-t flex flex-col gap-2">
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
                    <svg className="text-gray-450 shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <input 
                        type="number" 
                        value={fav.durationMinutes || 0} 
                        onChange={(e) => updateFavorite(fav.id, { durationMinutes: Number(e.target.value) })}
                        className="w-12 bg-transparent text-xs font-bold outline-none"
                    />
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                    <svg className="text-gray-450 shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
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
    );
}
