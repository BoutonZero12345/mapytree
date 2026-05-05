import { useOutletContext } from 'react-router-dom';
import Map from '../features/maps/components/Map';
import Timeline from '../features/planning/components/Timeline';

export default function Dashboard() {
    const { area } = useOutletContext();

    if (area === 'sidebar') {
        return <Timeline />;
    }

    if (area === 'map') {
        return <Map />;
    }

    return null;
}