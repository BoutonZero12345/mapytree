import { useState } from 'react';

export default function CreatePlanForm({ onCreate }) {
    const [newDateName, setNewDateName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newDateName.trim()) {
            onCreate(newDateName.trim());
            setNewDateName('');
        }
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 mb-6 md:mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Créer un nouveau planning</h2>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={newDateName}
                    onChange={(e) => setNewDateName(e.target.value)}
                    placeholder="Ex: Soirée Paris..."
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
    );
}