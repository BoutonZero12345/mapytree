import { useState } from 'react';

export default function PlanCard({ date, onClick, onDelete, onSaveEdit }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(date.name);

    const handleSave = (e) => {
        e.stopPropagation();
        if (editName.trim()) {
            onSaveEdit(date.id, editName.trim());
            setIsEditing(false);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm("Es-tu sûr de vouloir supprimer définitivement ce planning ?")) {
            onDelete(date.id);
        }
    };

    const startEditing = (e) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditName(date.name);
    };

    return (
        <div
            draggable={!isEditing}
            onDragStart={(e) => {
                e.dataTransfer.setData('text/planningId', date.id);
                e.dataTransfer.effectAllowed = 'move';
            }}
            onClick={() => !isEditing && onClick(date.id)}
            className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 transition-all cursor-pointer flex justify-between items-center group cursor-grab active:cursor-grabbing hover:shadow-md"
        >
            {isEditing ? (
                <div className="flex flex-1 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1 border rounded-md"
                    />
                    <button onClick={handleSave} className="bg-green-500 text-white px-3 py-1 rounded-md font-bold">OK</button>
                    <button onClick={() => setIsEditing(false)} className="bg-gray-300 px-3 py-1 rounded-md">X</button>
                </div>
            ) : (
                <>
                    <div>
                        <h3 className="font-bold text-gray-800 text-base md:text-lg group-hover:text-blue-600 transition-colors">
                            {date.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">
                            {date.updatedAt ? (
                                `Modifié le ${new Date(date.updatedAt).toLocaleDateString('fr-FR')} à ${new Date(date.updatedAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}`
                            ) : (
                                `Créé le ${new Date(date.createdAt).toLocaleDateString('fr-FR')}`
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={startEditing} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                        <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}