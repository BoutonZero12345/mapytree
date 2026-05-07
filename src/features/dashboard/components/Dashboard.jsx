import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDates, createNewDate, deleteDatePlan, updateDateName } from '../../../services/db';
import CreatePlanForm from './CreatePlanForm';
import PlanCard from './PlanCard';

export default function Dashboard() {
    const [dates, setDates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchDates = async () => {
        setIsLoading(true);
        const data = await getAllDates();
        setDates(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchDates();
    }, []);

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
        <div className="min-h-[100dvh] bg-gray-50 p-4 md:p-6 flex flex-col items-center">
            <div className="max-w-3xl w-full mt-6 md:mt-10">
                <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-6 md:mb-8 text-center">Mapytree</h1>

                <CreatePlanForm onCreate={handleCreate} />

                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Mes sorties ({dates.length})</h2>
                    {isLoading ? (
                        <p className="text-gray-500 text-center py-8">Chargement...</p>
                    ) : dates.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-2xl border border-gray-200 border-dashed">
                            <p className="text-gray-500">Aucun planning.</p>
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
            </div>
        </div>
    );
}