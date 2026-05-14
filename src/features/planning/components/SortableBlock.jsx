import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDateStore } from '../store/useDateStore';
import TransportSelector from './TransportSelector';

export default function SortableBlock({ block, index, travelInfo, isLast, nextBlockId, nextBlockMode, nextBlockRouteIndex }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

    const updateBlockDetails = useDateStore((state) => state.updateBlockDetails);
    const updateBlockColor = useDateStore((state) => state.updateBlockColor);
    const deleteBlock = useDateStore((state) => state.deleteBlock);

    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState(block.name);

    // NOUVEAU : On gère l'état ouvert/fermé (fermé par défaut)
    const [isExpanded, setIsExpanded] = useState(false);

    const PRESET_COLORS = ['#0ea5e9', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#94a3b8'];

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
        position: 'relative',
        borderLeftWidth: '4px',
        borderLeftColor: block.color || (block.type === 'EVENT' ? '#94a3b8' : '#0ea5e9')
    };

    const handleSaveName = () => {
        updateBlockDetails(block.id, { name: editName });
        setIsEditingName(false);
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div className={`bg-white border ${isDragging ? 'border-blue-500 shadow-xl' : (block.type === 'EVENT' ? 'border-dashed border-gray-300' : 'border-gray-200')} rounded-xl p-4 shadow-sm flex flex-col gap-2 transition-all`}>

                {/* En-tête (Titre, adresse, actions) */}
                <div className="flex items-center gap-3">

                    {/* Poignée de Drag & Drop */}
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 p-1 touch-none">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                    </div>

                    {/* Numéro ou Icône */}
                    <div className={`${block.type === 'EVENT' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'} font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0`}>
                        {block.type === 'EVENT' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        ) : (
                            index + 1
                        )}
                    </div>

                    {/* Textes (Maintenant cliquables pour ouvrir/fermer) */}
                    <div
                        className="flex-1 overflow-hidden cursor-pointer group"
                        onClick={() => !isEditingName && setIsExpanded(!isExpanded)}
                    >
                        {isEditingName ? (
                            <input
                                autoFocus
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onBlur={handleSaveName}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                onClick={(e) => e.stopPropagation()} // Empêche le clic de fermer l'accordéon quand on tape
                                className="w-full px-2 py-1 text-sm border rounded-md border-blue-500 outline-none"
                            />
                        ) : (
                            <>
                                <h3 className={`font-bold truncate group-hover:text-blue-600 transition-colors ${block.type === 'EVENT' ? 'text-gray-500 italic' : 'text-gray-800'}`}>
                                    {block.name}
                                </h3>
                                {block.type !== 'EVENT' && (
                                    <p className="text-xs text-gray-500 truncate">{block.address}</p>
                                )}
                            </>
                        )}
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-1 shrink-0">
                        {/* NOUVEAU : Bouton + / - */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                            className={`p-1 rounded-md transition-colors ${isExpanded ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-50'}`}
                            title={isExpanded ? "Masquer les détails" : "Voir les détails"}
                        >
                            {isExpanded ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            )}
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); setIsEditingName(!isEditingName); }} className="p-1 text-gray-400 hover:text-blue-600 rounded-md transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); if (window.confirm("Supprimer ?")) deleteBlock(block.id); }} className="p-1 text-gray-400 hover:text-red-600 rounded-md transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>

                {/* NOUVEAU : Zone de détails conditionnelle */}
                {isExpanded && (
                    <div className="pl-[3.5rem] flex flex-col gap-3 mt-2 pr-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-wrap items-center gap-3 md:gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">⏱️</span>
                                <input type="number" value={block.durationMinutes || ''} onChange={(e) => updateBlockDetails(block.id, { durationMinutes: Number(e.target.value) })} className="border border-gray-300 rounded-md px-2 py-1 w-16 text-sm outline-none focus:border-blue-500" />
                                <span className="text-sm text-gray-600">min</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">💶</span>
                                <input type="number" value={block.budget || ''} onChange={(e) => updateBlockDetails(block.id, { budget: Number(e.target.value) })} placeholder="0" className="border border-gray-300 rounded-md px-2 py-1 w-16 text-sm outline-none focus:border-blue-500" />
                                <span className="text-sm text-gray-600">€</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-sm text-gray-600 mt-1">📝</span>
                            <textarea value={block.notes || ''} onChange={(e) => updateBlockDetails(block.id, { notes: e.target.value })} placeholder="Mémos..." className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm resize-none h-14 outline-none focus:border-blue-500" />
                        </div>

                        {/* Sélecteur de couleur */}
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-sm text-gray-600">🎨</span>
                            <div className="flex flex-wrap gap-1.5">
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => updateBlockColor(block.id, color)}
                                        className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${block.color === color ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={block.color || '#0ea5e9'}
                                    onChange={(e) => updateBlockColor(block.id, e.target.value)}
                                    className="w-5 h-5 rounded-full overflow-hidden border-none p-0 cursor-pointer hover:scale-110 transition-transform"
                                />
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {!isLast && (
                <TransportSelector
                    nextBlockId={nextBlockId}
                    nextBlockMode={nextBlockMode}
                    nextBlockRouteIndex={nextBlockRouteIndex}
                    travelInfo={travelInfo}
                />
            )}
        </div>
    );
}