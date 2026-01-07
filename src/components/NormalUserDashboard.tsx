import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Incident, IncidentType, IncidentSeverity } from '../types';
import LiveMap from './LiveMap';
import ResourcesList from './ResourcesList';

const NormalUserDashboard: React.FC = () => {
    const { userProfile, logout } = useAuth();
    const [showReportForm, setShowReportForm] = useState(false);
    const [myIncidents, setMyIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    const [activeTab, setActiveTab] = useState<'dashboard' | 'resources'>('dashboard');

    // Fetch user's incidents
    useEffect(() => {
        if (!userProfile) return;

        const q = query(
            collection(db, 'incidents'),
            where('reportedBy', '==', userProfile.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const incidents: Incident[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                incidents.push({
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp?.toDate() || new Date(),
                    updates: data.updates?.map((u: any) => ({
                        ...u,
                        timestamp: u.timestamp?.toDate() || new Date()
                    })) || []
                } as Incident);
            });
            setMyIncidents(incidents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
        });

        return () => unsubscribe();
    }, [userProfile]);

    const handleReportIncident = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // DEMO MODE: Authentication removed for hackathon stability

        setLoading(true);
        const form = e.currentTarget;

        try {
            // DEMO: Using mocked location to avoid permission prompts
            const demoLat = 19.0760 + (Math.random() * 0.01 - 0.005);
            const demoLng = 72.8777 + (Math.random() * 0.01 - 0.005);

            const type = (form.elements.namedItem('type') as HTMLSelectElement).value as IncidentType;
            const severity = (form.elements.namedItem('severity') as HTMLSelectElement).value as IncidentSeverity;
            const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
            const imageFile = (form.elements.namedItem('image') as HTMLInputElement).files?.[0];

            let imageUrl: string | undefined;

            try {
                // Upload image if provided
                if (imageFile) {
                    const storageRef = ref(storage, `incidents/${Date.now()}_${imageFile.name}`);
                    await uploadBytes(storageRef, imageFile);
                    imageUrl = await getDownloadURL(storageRef);
                }
            } catch (uploadError) {
                console.warn("Image upload failed (ignoring for demo):", uploadError);
                // Continue without image
            }

            // Hardcoded Demo Reporter
            const demoReporter = {
                uid: "demo-user-normal",
                name: "Ram Verma",
                role: "normal",
                city: "Mumbai"
            };

            // Create flat, safe object for Firestore
            const incidentData = {
                reportedBy: demoReporter.uid,
                reportedByName: demoReporter.name,
                reportedByRole: 'normal',
                city: demoReporter.city,
                type: type,
                severity: severity,
                location: {
                    lat: demoLat,
                    lng: demoLng
                },
                status: 'pending',
                description: description,
                imageUrl: imageUrl || null, // Ensure valid null if undefined
                timestamp: new Date(),
                updates: []
            };

            await addDoc(collection(db, 'incidents'), incidentData);

            // Reset form
            form.reset();
            setShowReportForm(false);

            // Show success message
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-[100] animate-bounce';
            toast.textContent = '✅ Incident Reported Successfully!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);

        } catch (error: any) {
            console.error('Error reporting incident:', error);

            // Show precise error
            alert(`Failed to report incident. Error: ${error.message || 'Unknown Firestore Error'}`);
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
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-primary-600">ResQNet</h1>
                            <p className="text-sm text-gray-600">Welcome, {userProfile?.name}</p>
                        </div>
                        <button onClick={logout} className="btn-secondary text-sm">
                            Logout
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-4 border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'dashboard'
                                ? 'text-primary-600 border-b-2 border-primary-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            My Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('resources')}
                            className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'resources'
                                ? 'text-primary-600 border-b-2 border-primary-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Resources Available
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6">

                {activeTab === 'dashboard' ? (
                    <>
                        {/* Emergency Report Button - Prominent */}
                        <div className="mb-6">
                            <button
                                onClick={() => setShowReportForm(true)}
                                className="btn-danger w-full py-4 text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
                            >
                                🚨 REPORT EMERGENCY
                            </button>
                        </div>

                        {/* Report Form Modal */}
                        {showReportForm && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
                                    <h2 className="mb-4">Report Emergency</h2>

                                    <form onSubmit={handleReportIncident}>
                                        <div className="mb-4">
                                            <label className="label">Incident Type</label>
                                            <select name="type" required className="input-field">
                                                <option value="">Select type</option>
                                                <option value="accident">Accident</option>
                                                <option value="fire">Fire</option>
                                                <option value="medical">Medical Emergency</option>
                                                <option value="flood">Flood</option>
                                                <option value="earthquake">Earthquake</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="label">Severity</label>
                                            <select name="severity" required className="input-field">
                                                <option value="">Select severity</option>
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="label">Description</label>
                                            <textarea
                                                name="description"
                                                required
                                                rows={3}
                                                className="input-field"
                                                placeholder="Describe the emergency..."
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

                                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-4">
                                            <p className="text-sm text-primary-800">
                                                📍 Using Demo Location (Simulated)
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowReportForm(false)}
                                                className="btn-secondary flex-1"
                                                disabled={loading}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn-danger flex-1"
                                                disabled={loading}
                                            >
                                                {loading ? 'Reporting...' : 'Submit Report'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Live Map */}
                        <div className="card mb-6">
                            <h2 className="mb-4">Live Incident Map - {userProfile?.city}</h2>
                            <LiveMap
                                city={userProfile?.city}
                                height="400px"
                                onIncidentClick={setSelectedIncident}
                            />
                        </div>

                        {/* My Incidents */}
                        <div className="card">
                            <h2 className="mb-4">My Reported Incidents</h2>

                            {myIncidents.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    You haven't reported any incidents yet
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {myIncidents.map((incident) => (
                                        <div
                                            key={incident.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => setSelectedIncident(incident)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold capitalize">{incident.type}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(incident.status)}`}>
                                                    {incident.status.replace('-', ' ')}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-2">{incident.description}</p>

                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <span>Severity: <span className={
                                                    incident.severity === 'High' ? 'text-danger-600 font-semibold' :
                                                        incident.severity === 'Medium' ? 'text-warning-600 font-semibold' :
                                                            'text-success-600 font-semibold'
                                                }>{incident.severity}</span></span>
                                                <span>{new Date(incident.timestamp).toLocaleString()}</span>
                                            </div>

                                            {incident.updates.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-gray-200">
                                                    <p className="text-xs text-primary-600 font-semibold">
                                                        Latest: {incident.updates[incident.updates.length - 1].message}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <ResourcesList />
                )}

                {/* Incident Detail Modal */}
                {selectedIncident && (
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
                                        <p className="text-sm text-gray-600">Reported</p>
                                        <p className="font-semibold">{new Date(selectedIncident.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>

                                {selectedIncident.updates.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Updates</h3>
                                        <div className="space-y-2">
                                            {selectedIncident.updates.map((update) => (
                                                <div key={update.id} className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm">{update.message}</p>
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

export default NormalUserDashboard;
