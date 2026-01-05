import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Incident, IncidentUpdate } from '../types';
import LiveMap from './LiveMap';

const VolunteerDashboard: React.FC = () => {
    const { userProfile, logout } = useAuth();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [myIncidents, setMyIncidents] = useState<Incident[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch city incidents
    useEffect(() => {
        if (!userProfile) return;

        const q = query(
            collection(db, 'incidents'),
            where('city', '==', userProfile.city),
            where('status', 'in', ['pending', 'verified', 'in-progress'])
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

            const sorted = incidentData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            setIncidents(sorted);

            // Filter my assigned incidents
            setMyIncidents(sorted.filter(i => i.assignedVolunteer === userProfile.uid));
        });

        return () => unsubscribe();
    }, [userProfile]);

    const handleAcceptIncident = async (incidentId: string) => {
        if (!userProfile) return;

        try {
            const incidentRef = doc(db, 'incidents', incidentId);
            await updateDoc(incidentRef, {
                assignedVolunteer: userProfile.uid,
                assignedVolunteerName: userProfile.name,
                status: 'verified'
            });
            alert('Incident accepted! You can now provide updates.');
        } catch (error) {
            console.error('Error accepting incident:', error);
            alert('Failed to accept incident');
        }
    };

    const handleSubmitUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!userProfile || !selectedIncident) return;

        setLoading(true);
        const form = e.currentTarget;

        try {
            const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;
            const imageFile = (form.elements.namedItem('image') as HTMLInputElement).files?.[0];
            const newStatus = (form.elements.namedItem('status') as HTMLSelectElement).value;

            let imageUrl: string | undefined;

            if (imageFile) {
                const storageRef = ref(storage, `updates/${Date.now()}_${imageFile.name}`);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            const update: IncidentUpdate = {
                id: Date.now().toString(),
                timestamp: new Date(),
                updatedBy: userProfile.uid,
                updatedByRole: 'volunteer',
                message,
                imageUrl,
                status: newStatus as any
            };

            const incidentRef = doc(db, 'incidents', selectedIncident.id);
            await updateDoc(incidentRef, {
                updates: arrayUnion(update),
                status: newStatus
            });

            form.reset();
            setShowUpdateForm(false);
            setSelectedIncident(null);
            alert('Update submitted successfully!');
        } catch (error) {
            console.error('Error submitting update:', error);
            alert('Failed to submit update');
        } finally {
            setLoading(false);
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-primary-600">ResQNet Volunteer</h1>
                            <p className="text-sm text-gray-600">
                                {userProfile?.name} • {userProfile?.volunteerCategory}
                            </p>
                        </div>
                        <button onClick={logout} className="btn-secondary text-sm">
                            Logout
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-primary-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-primary-600">{myIncidents.length}</p>
                            <p className="text-xs text-gray-600">My Incidents</p>
                        </div>
                        <div className="bg-warning-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-warning-600">
                                {incidents.filter(i => i.status === 'pending').length}
                            </p>
                            <p className="text-xs text-gray-600">Pending</p>
                        </div>
                        <div className="bg-success-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-success-600">
                                {incidents.filter(i => i.status === 'in-progress').length}
                            </p>
                            <p className="text-xs text-gray-600">In Progress</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Live Map */}
                <div className="card mb-6">
                    <h2 className="mb-4">Live Incident Map - {userProfile?.city}</h2>
                    <LiveMap
                        city={userProfile?.city}
                        height="400px"
                        onIncidentClick={setSelectedIncident}
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Available Incidents */}
                    <div className="card">
                        <h2 className="mb-4">Available Incidents</h2>

                        {incidents.filter(i => !i.assignedVolunteer).length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                No available incidents
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                {incidents.filter(i => !i.assignedVolunteer).map((incident) => (
                                    <div
                                        key={incident.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold capitalize">{incident.type}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(incident.status)}`}>
                                                {incident.status}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-2">{incident.description}</p>

                                        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                                            <span>Severity: <span className={
                                                incident.severity === 'High' ? 'text-danger-600 font-semibold' :
                                                    incident.severity === 'Medium' ? 'text-warning-600 font-semibold' :
                                                        'text-success-600 font-semibold'
                                            }>{incident.severity}</span></span>
                                            <span>{new Date(incident.timestamp).toLocaleString()}</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedIncident(incident)}
                                                className="btn-secondary text-sm flex-1"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => handleAcceptIncident(incident.id)}
                                                className="btn-primary text-sm flex-1"
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* My Assigned Incidents */}
                    <div className="card">
                        <h2 className="mb-4">My Assigned Incidents</h2>

                        {myIncidents.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                No assigned incidents yet
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                {myIncidents.map((incident) => (
                                    <div
                                        key={incident.id}
                                        className="border border-primary-200 bg-primary-50 rounded-lg p-4"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold capitalize">{incident.type}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(incident.status)}`}>
                                                {incident.status}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-2">{incident.description}</p>

                                        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                                            <span>Severity: <span className={
                                                incident.severity === 'High' ? 'text-danger-600 font-semibold' :
                                                    incident.severity === 'Medium' ? 'text-warning-600 font-semibold' :
                                                        'text-success-600 font-semibold'
                                            }>{incident.severity}</span></span>
                                            <span>{new Date(incident.timestamp).toLocaleString()}</span>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setSelectedIncident(incident);
                                                setShowUpdateForm(true);
                                            }}
                                            className="btn-primary text-sm w-full"
                                        >
                                            Add Update
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Update Form Modal */}
                {showUpdateForm && selectedIncident && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="card max-w-md w-full">
                            <h2 className="mb-4">Add Update</h2>

                            <form onSubmit={handleSubmitUpdate}>
                                <div className="mb-4">
                                    <label className="label">Update Message</label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={3}
                                        className="input-field"
                                        placeholder="Describe the current situation..."
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="label">Photo (Optional)</label>
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        className="input-field"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="label">Update Status</label>
                                    <select name="status" required className="input-field" defaultValue={selectedIncident.status}>
                                        <option value="verified">Verified</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUpdateForm(false);
                                            setSelectedIncident(null);
                                        }}
                                        className="btn-secondary flex-1"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-success flex-1"
                                        disabled={loading}
                                    >
                                        {loading ? 'Submitting...' : 'Submit Update'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Incident Detail Modal */}
                {selectedIncident && !showUpdateForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="capitalize">{selectedIncident.type}</h2>
                                <button
                                    onClick={() => setSelectedIncident(null)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-4">
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
                                </div>

                                {selectedIncident.updates.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Updates</h3>
                                        <div className="space-y-2">
                                            {selectedIncident.updates.map((update) => (
                                                <div key={update.id} className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm">{update.message}</p>
                                                    {update.imageUrl && (
                                                        <img src={update.imageUrl} alt="Update" className="mt-2 rounded" />
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

export default VolunteerDashboard;
