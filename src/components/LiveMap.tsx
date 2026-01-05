import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Incident, IncidentStatus } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons based on status
const getMarkerIcon = (status: IncidentStatus) => {
    const colors: Record<IncidentStatus, string> = {
        pending: '#9ca3af', // gray
        verified: '#fbbf24', // yellow
        'in-progress': '#f97316', // orange
        resolved: '#22c55e', // green
    };

    const color = colors[status];

    return L.divIcon({
        className: 'custom-marker',
        html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

// Component to recenter map when incidents change
const MapUpdater: React.FC<{ incidents: Incident[] }> = ({ incidents }) => {
    const map = useMap();

    useEffect(() => {
        if (incidents.length > 0) {
            const bounds = L.latLngBounds(
                incidents.map(inc => [inc.location.lat, inc.location.lng])
            );
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        }
    }, [incidents, map]);

    return null;
};

interface LiveMapProps {
    city?: string;
    height?: string;
    onIncidentClick?: (incident: Incident) => void;
}

const LiveMap: React.FC<LiveMapProps> = ({
    city,
    height = '500px',
    onIncidentClick
}) => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [center, setCenter] = useState<[number, number]>([20.5937, 78.9629]); // India center

    useEffect(() => {
        // Build query based on city filter
        let q = query(collection(db, 'incidents'));

        if (city) {
            q = query(collection(db, 'incidents'), where('city', '==', city));
        }

        // Real-time listener for incidents
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const incidentData: Incident[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                incidentData.push({
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp?.toDate() || new Date(),
                    updates: data.updates?.map((u: any) => ({
                        ...u,
                        timestamp: u.timestamp?.toDate() || new Date()
                    })) || []
                } as Incident);
            });

            setIncidents(incidentData);

            // Update map center to first incident if available
            if (incidentData.length > 0) {
                setCenter([incidentData[0].location.lat, incidentData[0].location.lng]);
            }
        });

        return () => unsubscribe();
    }, [city]);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'High': return 'text-danger-600';
            case 'Medium': return 'text-warning-600';
            case 'Low': return 'text-success-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusBadge = (status: IncidentStatus) => {
        const styles: Record<IncidentStatus, string> = {
            pending: 'bg-gray-100 text-gray-800',
            verified: 'bg-yellow-100 text-yellow-800',
            'in-progress': 'bg-orange-100 text-orange-800',
            resolved: 'bg-success-100 text-success-800',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </span>
        );
    };

    return (
        <div className="relative">
            <MapContainer
                center={center}
                zoom={12}
                style={{ height, width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater incidents={incidents} />

                {incidents.map((incident) => (
                    <Marker
                        key={incident.id}
                        position={[incident.location.lat, incident.location.lng]}
                        icon={getMarkerIcon(incident.status)}
                        eventHandlers={{
                            click: () => onIncidentClick?.(incident)
                        }}
                    >
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                <h3 className="font-semibold text-lg mb-2 capitalize">
                                    {incident.type}
                                </h3>

                                <div className="space-y-1 text-sm mb-2">
                                    <p>
                                        <span className="font-medium">Severity:</span>{' '}
                                        <span className={getSeverityColor(incident.severity)}>
                                            {incident.severity}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="font-medium">Status:</span>{' '}
                                        {getStatusBadge(incident.status)}
                                    </p>
                                    <p>
                                        <span className="font-medium">Reported by:</span>{' '}
                                        {incident.reportedByName}
                                    </p>
                                    <p className="text-gray-600">
                                        {new Date(incident.timestamp).toLocaleString()}
                                    </p>
                                </div>

                                {incident.description && (
                                    <p className="text-sm text-gray-700 border-t pt-2">
                                        {incident.description}
                                    </p>
                                )}

                                {onIncidentClick && (
                                    <button
                                        onClick={() => onIncidentClick(incident)}
                                        className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-semibold"
                                    >
                                        View Details →
                                    </button>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
                <h4 className="font-semibold text-sm mb-2">Status Legend</h4>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                        <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                        <span>Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-orange-400"></div>
                        <span>In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-success-500"></div>
                        <span>Resolved</span>
                    </div>
                </div>
            </div>

            {/* Incident counter */}
            <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
                <p className="text-sm font-semibold">
                    Active Incidents: <span className="text-primary-600">{incidents.filter(i => i.status !== 'resolved').length}</span>
                </p>
            </div>
        </div>
    );
};

export default LiveMap;
