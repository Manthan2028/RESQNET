import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Incident, User, IncidentStatus } from '../types';
import LiveMap from './LiveMap';

const AgencyDashboard: React.FC = () => {
    const { userProfile, logout } = useAuth();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [volunteers, setVolunteers] = useState<User[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');

    // Fetch city incidents
    useEffect(() => {
        if (!userProfile) return;

        const q = query(
            collection(db, 'incidents'),
            where('city', '==', userProfile.city)
        );

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
            setIncidents(incidentData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
        });

        return () => unsubscribe();
    }, [userProfile]);

    // Fetch city volunteers
    useEffect(() => {
        if (!userProfile) return;

        const q = query(
            collection(db, 'users'),
            where('role', '==', 'volunteer'),
            where('city', '==', userProfile.city)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const volunteerData: User[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                volunteerData.push({
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date()
                } as User);
            });
            setVolunteers(volunteerData);
        });

        return () => unsubscribe();
    }, [userProfile]);

    const handleUpdateStatus = async (incidentId: string, newStatus: IncidentStatus) => {
        try {
            const incidentRef = doc(db, 'incidents', incidentId);
            await updateDoc(incidentRef, {
                status: newStatus
            });
            alert('Status updated successfully!');
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleAssignVolunteer = async (incidentId: string, volunteerId: string) => {
        try {
            const volunteer = volunteers.find(v => v.uid === volunteerId);
            if (!volunteer) return;

            const incidentRef = doc(db, 'incidents', incidentId);
            await updateDoc(incidentRef, {
                assignedVolunteer: volunteerId,
                assignedVolunteerName: volunteer.name,
                status: 'verified'
            });
            alert('Volunteer assigned successfully!');
        } catch (error) {
            console.error('Error assigning volunteer:', error);
            alert('Failed to assign volunteer');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-gray-100 text-gray-800';
            case 'verified': return 'bg-yellow-100 text-yellow-800';
            case 'in-progress': return 'bg-orange-100 text-orange-800';
            case 'resolved': return 'bg-success-100 text-success-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredIncidents = incidents.filter(incident => {
        if (filterStatus !== 'all' && incident.status !== filterStatus) return false;
        if (filterSeverity !== 'all' && incident.severity !== filterSeverity) return false;
        return true;
    });

    const stats = {
        total: incidents.length,
        active: incidents.filter(i => i.status !== 'resolved').length,
        resolved: incidents.filter(i => i.status === 'resolved').length,
        high: incidents.filter(i => i.severity === 'High' && i.status !== 'resolved').length
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-primary-600">ResQNet Control Room</h1>
                            <p className="text-sm text-gray-600">
                                {userProfile?.authorityName} • {userProfile?.city}
                            </p>
                        </div>
                        <button onClick={logout} className="btn-secondary text-sm">
                            Logout
                        </button>
                    </div>

                    {/* Analytics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                            <p className="text-3xl font-bold text-primary-600">{stats.total}</p>
                            <p className="text-sm text-gray-600">Total Incidents</p>
                        </div>
                        <div className="bg-warning-50 rounded-lg p-4 border border-warning-200">
                            <p className="text-3xl font-bold text-warning-600">{stats.active}</p>
                            <p className="text-sm text-gray-600">Active Incidents</p>
                        </div>
                        <div className="bg-success-50 rounded-lg p-4 border border-success-200">
                            <p className="text-3xl font-bold text-success-600">{stats.resolved}</p>
                            <p className="text-sm text-gray-600">Resolved</p>
                        </div>
                        <div className="bg-danger-50 rounded-lg p-4 border border-danger-200">
                            <p className="text-3xl font-bold text-danger-600">{stats.high}</p>
                            <p className="text-sm text-gray-600">High Priority</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Live Map */}
                <div className="card mb-6">
                    <h2 className="mb-4">City-Wide Live Incident Map</h2>
                    <LiveMap
                        city={userProfile?.city}
                        height="500px"
                        onIncidentClick={setSelectedIncident}
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Incident Management */}
                    <div className="lg:col-span-2 card">
                        <div className="flex justify-between items-center mb-4">
                            <h2>Incident Management</h2>

                            <div className="flex gap-2">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="text-sm border border-gray-300 rounded px-2 py-1"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="verified">Verified</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                </select>

                                <select
                                    value={filterSeverity}
                                    onChange={(e) => setFilterSeverity(e.target.value)}
                                    className="text-sm border border-gray-300 rounded px-2 py-1"
                                >
                                    <option value="all">All Severity</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left p-2">Type</th>
                                        <th className="text-left p-2">Severity</th>
                                        <th className="text-left p-2">Status</th>
                                        <th className="text-left p-2">Reporter</th>
                                        <th className="text-left p-2">Volunteer</th>
                                        <th className="text-left p-2">Time</th>
                                        <th className="text-left p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredIncidents.map((incident) => (
                                        <tr key={incident.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="p-2 capitalize">{incident.type}</td>
                                            <td className="p-2">
                                                <span className={
                                                    incident.severity === 'High' ? 'text-danger-600 font-semibold' :
                                                        incident.severity === 'Medium' ? 'text-warning-600 font-semibold' :
                                                            'text-success-600 font-semibold'
                                                }>
                                                    {incident.severity}
                                                </span>
                                            </td>
                                            <td className="p-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(incident.status)}`}>
                                                    {incident.status}
                                                </span>
                                            </td>
                                            <td className="p-2">{incident.reportedByName}</td>
                                            <td className="p-2">{incident.assignedVolunteerName || '-'}</td>
                                            <td className="p-2 text-xs text-gray-500">
                                                {new Date(incident.timestamp).toLocaleString()}
                                            </td>
                                            <td className="p-2">
                                                <button
                                                    onClick={() => setSelectedIncident(incident)}
                                                    className="text-primary-600 hover:text-primary-700 font-semibold text-xs"
                                                >
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredIncidents.length === 0 && (
                                <p className="text-center text-gray-500 py-8">No incidents found</p>
                            )}
                        </div>
                    </div>

                    {/* Volunteer Community */}
                    <div className="card">
                        <h2 className="mb-4">Volunteer Community</h2>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                Total Volunteers: <span className="font-semibold text-primary-600">{volunteers.length}</span>
                            </p>
                        </div>

                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {volunteers.map((volunteer) => (
                                <div
                                    key={volunteer.uid}
                                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                                >
                                    <h3 className="font-semibold">{volunteer.name}</h3>
                                    <p className="text-xs text-gray-600">{volunteer.volunteerCategory}</p>
                                    <p className="text-xs text-gray-500">{volunteer.phone}</p>

                                    <div className="mt-2">
                                        {volunteer.isAvailable ? (
                                            <span className="px-2 py-1 bg-success-100 text-success-800 rounded-full text-xs font-semibold">
                                                Available
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                                                Busy
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {volunteers.length === 0 && (
                                <p className="text-gray-500 text-center py-8 text-sm">
                                    No volunteers registered yet
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Incident Management Modal */}
                {selectedIncident && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="capitalize">{selectedIncident.type}</h2>
                                    <p className="text-sm text-gray-600">ID: {selectedIncident.id}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedIncident(null)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Status Update */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">Update Status</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateStatus(selectedIncident.id, 'pending')}
                                            className="btn-secondary text-xs"
                                        >
                                            Pending
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedIncident.id, 'verified')}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                                        >
                                            Verified
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedIncident.id, 'in-progress')}
                                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs"
                                        >
                                            In Progress
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedIncident.id, 'resolved')}
                                            className="btn-success text-xs"
                                        >
                                            Resolved
                                        </button>
                                    </div>
                                </div>

                                {/* Assign Volunteer */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">Assign Volunteer</h3>
                                    <select
                                        onChange={(e) => handleAssignVolunteer(selectedIncident.id, e.target.value)}
                                        className="input-field text-sm"
                                        defaultValue=""
                                    >
                                        <option value="">Select volunteer...</option>
                                        {volunteers.filter(v => v.isAvailable).map((volunteer) => (
                                            <option key={volunteer.uid} value={volunteer.uid}>
                                                {volunteer.name} - {volunteer.volunteerCategory}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedIncident.assignedVolunteerName && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Currently assigned: <span className="font-semibold">{selectedIncident.assignedVolunteerName}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Incident Details */}
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedIncident.status)}`}>
                                        {selectedIncident.status.replace('-', ' ')}
                                    </span>
                                </div>

                                {selectedIncident.imageUrl && (
                                    <img
                                        src={selectedIncident.imageUrl}
                                        alt="Incident"
                                        className="w-full rounded-lg"
                                    />
                                )}

                                <div>
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <p className="text-gray-700">{selectedIncident.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Severity</p>
                                        <p className="font-semibold">{selectedIncident.severity}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Reported By</p>
                                        <p className="font-semibold">{selectedIncident.reportedByName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Location</p>
                                        <p className="font-semibold">
                                            {selectedIncident.location.lat.toFixed(4)}, {selectedIncident.location.lng.toFixed(4)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Time</p>
                                        <p className="font-semibold">{new Date(selectedIncident.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>

                                {selectedIncident.updates.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Volunteer Updates</h3>
                                        <div className="space-y-2">
                                            {selectedIncident.updates.map((update) => (
                                                <div key={update.id} className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm">{update.message}</p>
                                                    {update.imageUrl && (
                                                        <img src={update.imageUrl} alt="Update" className="mt-2 rounded max-w-xs" />
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(update.timestamp).toLocaleString()} - {update.updatedByRole}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgencyDashboard;
