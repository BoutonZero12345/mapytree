import { useDateStore } from '../store/useDateStore';
import ModeButtons from './ModeButtons';
import TransitFilters from './TransitFilters';
import RouteAlternatives from './RouteAlternatives';
import RouteDetails from './RouteDetails';

export default function TransportSelector({ nextBlockId, nextBlockMode, nextBlockRouteIndex, travelInfo }) {
    const updateBlockTravelMode = useDateStore((state) => state.updateBlockTravelMode);
    const updateBlockRouteIndex = useDateStore((state) => state.updateBlockRouteIndex);
    const updateBlockDetails = useDateStore((state) => state.updateBlockDetails);

    const block = useDateStore((state) => state.blocks.find(b => b.id === nextBlockId));
    const isLocked = block?.isTransportLocked || false;

    const toggleLock = () => {
        updateBlockDetails(nextBlockId, { isTransportLocked: !isLocked });
    };

    if (!travelInfo || travelInfo.duration === '0 min' || travelInfo.duration === 'N/A' || nextBlockMode === 'NONE') {
        return null;
    }

    return (
        <div className="flex flex-col gap-2.5 py-2.5 transition-all select-none">
            <ModeButtons 
                nextBlockId={nextBlockId}
                nextBlockMode={nextBlockMode}
                updateBlockTravelMode={updateBlockTravelMode}
                isLocked={isLocked}
            />

            <TransitFilters 
                block={block}
                nextBlockId={nextBlockId}
                nextBlockMode={nextBlockMode}
                updateBlockDetails={updateBlockDetails}
                isLocked={isLocked}
            />

            <RouteAlternatives 
                travelInfo={travelInfo}
                nextBlockRouteIndex={nextBlockRouteIndex}
                nextBlockId={nextBlockId}
                updateBlockRouteIndex={updateBlockRouteIndex}
                isLocked={isLocked}
            />

            <RouteDetails 
                nextBlockMode={nextBlockMode}
                travelInfo={travelInfo}
                isLocked={isLocked}
                toggleLock={toggleLock}
            />
        </div>
    );
}