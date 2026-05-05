import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDates, createNewDate } from '../../../services/db';

export default function Dashboard() {
    const [dates, setDates] = useState([]);
    const [newDateName, setNewDateName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDates = async () => {
            const data = await getAllDates();
            setDates(data);
            setIsLoading(false);
        };
        fetchDates();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newDateName.trim()) return;

        const newDate = await createNewDate(newDateName.trim());
        if (newDate) {
            navigate(`/plan/${newDate.id}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            <div className="max-w-3xl w-full mt-10">
                <h1 className="text-4xl font-extrabold text-blue-600 mb-8 text-center">Mapytree</h1>

                {/* Formulaire de création */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Créer un nouveau planning</h2>
                    <form onSubmit={handleCreate} className="flex gap-3">
                        <input
                            type="text"
                            value={newDateName}
                            onChange={(e) => setNewDateName(e.target.value)}
                            placeholder="Ex: Soirée Paris 11ème, Sortie au Louvre..."
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={!newDateName.trim()}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            Nouveau
                        </button>
                    </form>
                </div>

                {/* Liste des projets existants */}
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Mes sorties ({dates.length})</h2>
                    {isLoading ? (
                        <p className="text-gray-500 text-center py-8">Chargement de vos données...</p>
                    ) : dates.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-2xl border border-gray-200 border-dashed">
                            <p className="text-gray-500">Vous n'avez pas encore de planning.</p>
                            <p className="text-sm text-gray-400 mt-1">Créez-en un juste au-dessus !</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {dates.map(date => (
                                <div
                                    key={date.id}
                                    onClick={() => navigate(`/plan/${date.id}`)}
                                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex justify-between items-center group"
                                >
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">{date.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">Créé le {new Date(date.createdAt).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                    <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}