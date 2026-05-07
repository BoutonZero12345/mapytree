import { PolylineF } from '@react-google-maps/api';

export default function RouteRenderer({ segments }) {
    if (!segments || segments.length === 0) return null;

    return (
        <>
            {segments.map((steps, segIdx) =>
                steps.map((step, stepIdx) => {
                    const isDashed = step.mode === 'WALKING' || step.mode === 'BICYCLING';

                    return (
                        <PolylineF
                            key={`${segIdx}-${stepIdx}`}
                            path={window.google.maps.geometry.encoding.decodePath(step.path)}
                            options={{
                                strokeColor: step.color.startsWith('#') ? step.color : `#${step.color}`,
                                strokeOpacity: isDashed ? 0 : 0.9,
                                strokeWeight: 5,
                                icons: isDashed ? [{
                                    icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.8, scale: 3 },
                                    offset: '0',
                                    repeat: '15px'
                                }] : []
                            }}
                        />
                    );
                })
            )}
        </>
    );
}