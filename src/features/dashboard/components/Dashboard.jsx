import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDates, createNewDate, deleteDatePlan, updateDateName } from '../../../services/db';

export default function Dashboard() {
    const [dates, setDates] = useState([]);
    const [newDateName, setNewDateName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchDates = async () => {
        setIsLoading(true);
        const data = await getAllDates();
        setDates(data);
        setIsLoading(false);
    };

    useEffect(() => { fetchDates(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newDateName.trim()) return;
        const newDate = await createNewDate(newDateName.trim());
        if (newDate) navigate(`/plan/${newDate.id}`);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Empêche d'ouvrir le projet en cliquant sur la poubelle
        if (window.confirm("Es-tu sûr de vouloir supprimer définitivement cette sortie ?")) {
            await deleteDatePlan(id);
            fetchDates();
        }
    };

    const startEditing = (e, date) => {
        e.stopPropagation();
        setEditingId(date.id);
        setEditName(date.name);
    };

    const saveEdit = async (e, id) => {
        e.stopPropagation();
        if (editName.trim()) {
            await updateDateName(id, editName.trim());
            setEditingId(null);
            fetchDates();
        }
    };

    return (
        <div className="min-h-[100dvh] bg-gray-50 p-4 md:p-6 flex flex-col items-center">
            <div className="max-w-3xl w-full mt-6 md:mt-10">
                <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-6 md:mb-8 text-center">Mapytree</h1>

                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 mb-6 md:mb-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Créer un nouveau planning</h2>
                    <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
                        <input type="text" value={newDateName} onChange={(e) => setNewDateName(e.target.value)} placeholder="Ex: Soirée Paris..." className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button type="submit" disabled={!newDateName.trim()} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">Nouveau</button>
                    </form>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Mes sorties ({dates.length})</h2>
                    {isLoading ? (
                        <p className="text-gray-500 text-center py-8">Chargement...</p>
                    ) : dates.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-2xl border border-gray-200 border-dashed"><p className="text-gray-500">Aucun planning.</p></div>
                    ) : (
                        <div className="grid gap-3 md:gap-4">
                            {dates.map(date => (
                                <div key={date.id} onClick={() => !editingId && navigate(`/plan/${date.id}`)} className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 transition-all cursor-pointer flex justify-between items-center group">
                                    {editingId === date.id ? (
                                        <div className="flex flex-1 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <input autoFocus type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 px-3 py-1 border rounded-md" />
                                            <button onClick={(e) => saveEdit(e, date.id)} className="bg-green-500 text-white px-3 py-1 rounded-md font-bold">OK</button>
                                            <button onClick={() => setEditingId(null)} className="bg-gray-300 px-3 py-1 rounded-md">X</button>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-base md:text-lg group-hover:text-blue-600">{date.name}</h3>
                                                <p className="text-xs md:text-sm text-gray-500 mt-1">Créé le {new Date(date.createdAt).toLocaleDateString('fr-FR')}</p>
                                            </div>
                                            <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => startEditing(e, date)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                                                <button onClick={(e) => handleDelete(e, date.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}