import React, { useState, useEffect } from 'react';
import { ResourceItem, ResourceType, ResourceStatus } from '../types';

const SAMPLE_AREAS = [
    { city: 'Mumbai', locations: ['Dadar', 'Andheri', 'Bandra', 'Colaba'] },
    { city: 'Navi Mumbai', locations: ['Vashi', 'Nerul', 'Belapur', 'Panvel'] },
    { city: 'Thane', locations: ['Thane West', 'Ghodbunder', 'Kalyan'] }
];

const RESOURCE_TYPES: ResourceType[] = ['Ambulance', 'Hospital Beds', 'Food', 'Water', 'Shelter', 'Blood', 'Rescue Equipment'];

const ResourcesList: React.FC = () => {
    const [resources, setResources] = useState<ResourceItem[]>([]);
    const [filterType, setFilterType] = useState<ResourceType | 'All'>('All');
    const [filterStatus, setFilterStatus] = useState<ResourceStatus | 'All'>('All');
    const [filterCity, setFilterCity] = useState<string>('All');

    // Initialize Demo Data
    useEffect(() => {
        const stored = localStorage.getItem('resqnet_demo_resources');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Convert strings back to Dates
            const hydrated = parsed.map((item: any) => ({
                ...item,
                lastUpdated: new Date(item.lastUpdated)
            }));
            setResources(hydrated);
        } else {
            // Generate Random Demo Data
            const initialData: ResourceItem[] = Array.from({ length: 15 }).map((_, i) => {
                const area = SAMPLE_AREAS[Math.floor(Math.random() * SAMPLE_AREAS.length)];
                const loc = area.locations[Math.floor(Math.random() * area.locations.length)];
                const type = RESOURCE_TYPES[Math.floor(Math.random() * RESOURCE_TYPES.length)];

                return {
                    id: `res-${Date.now()}-${i}`,
                    type: type,
                    city: area.city,
                    location: loc,
                    status: Math.random() > 0.3 ? 'Available' : (Math.random() > 0.5 ? 'Limited' : 'Unavailable'),
                    quantity: Math.floor(Math.random() * 50) + 1 + (type === 'Food' || type === 'Water' ? ' Packets' : ' Units'),
                    providerName: `Demo Provider ${i + 1}`,
                    contactNr: `+91 98765 4321${i}`,
                    lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 10000000))
                };
            });

            // Sort by status (Available first)
            initialData.sort((a, b) => {
                if (a.status === 'Available' && b.status !== 'Available') return -1;
                if (a.status !== 'Available' && b.status === 'Available') return 1;
                return 0;
            });

            localStorage.setItem('resqnet_demo_resources', JSON.stringify(initialData));
            setResources(initialData);
        }
    }, []);

    const filteredResources = resources.filter(r => {
        if (filterType !== 'All' && r.type !== filterType) return false;
        if (filterStatus !== 'All' && r.status !== filterStatus) return false;
        if (filterCity !== 'All' && r.city !== filterCity) return false;
        return true;
    });

    const getStatusColor = (status: ResourceStatus) => {
        switch (status) {
            case 'Available': return 'bg-green-100 text-green-800 border-green-200';
            case 'Limited': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Unavailable': return 'bg-red-100 text-red-800 border-red-200';
        }
    };

    const getTypeIcon = (type: ResourceType) => {
        switch (type) {
            case 'Ambulance': return '🚑';
            case 'Hospital Beds': return '🛏️';
            case 'Food': return '🍲';
            case 'Water': return '💧';
            case 'Shelter': return '⛺';
            case 'Blood': return '🩸';
            case 'Rescue Equipment': return '🛠️';
            default: return '📦';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Available Resources</h2>
                        <p className="text-sm text-gray-600">Real-time availability of essential supplies and services</p>
                    </div>
                    <div className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                        Demo Mode: Data stored locally
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        className="input-field"
                        value={filterCity}
                        onChange={(e) => setFilterCity(e.target.value)}
                    >
                        <option value="All">All Cities</option>
                        {SAMPLE_AREAS.map(a => <option key={a.city} value={a.city}>{a.city}</option>)}
                    </select>

                    <select
                        className="input-field"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                    >
                        <option value="All">All Resource Types</option>
                        {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <select
                        className="input-field"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Available">Available</option>
                        <option value="Limited">Limited</option>
                        <option value="Unavailable">Unavailable</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(resource => (
                    <div key={resource.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden group">
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="text-4xl p-2 bg-gray-50 rounded-lg group-hover:bg-primary-50 transition-colors">
                                    {getTypeIcon(resource.type)}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(resource.status)}`}>
                                    {resource.status}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 mb-1">{resource.type}</h3>
                            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                                📍 {resource.location}, {resource.city}
                            </p>

                            <div className="space-y-2 text-sm text-gray-600 border-t pt-4">
                                <div className="flex justify-between">
                                    <span>Quantity:</span>
                                    <span className="font-semibold text-gray-900">{resource.quantity}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Provider:</span>
                                    <span className="font-medium">{resource.providerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Contact:</span>
                                    <span className="text-blue-600">{resource.contactNr}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                            <span>Updated: {resource.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredResources.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">🔍</div>
                    <p>No resources match your filters.</p>
                </div>
            )}
        </div>
    );
};

export default ResourcesList;
