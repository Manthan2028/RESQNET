import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import NormalUserDashboard from './components/NormalUserDashboard';
import VolunteerDashboard from './components/VolunteerDashboard';
import AgencyDashboard from './components/AgencyDashboard';
import { UserRole } from './types';

// DEMO: Floating Role Switcher Component
const DemoRoleSwitcher: React.FC = () => {
    const { userProfile, switchRole } = useAuth();

    if (!userProfile) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-xl border-2 border-primary-500 z-50 animate-fade-in-up">
            <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Hackathon Demo Mode
            </h3>
            <div className="flex flex-col gap-2">
                <div className="text-xs text-gray-500 mb-1">Current View:</div>
                {(['agency', 'volunteer', 'normal'] as UserRole[]).map((role) => (
                    <button
                        key={role}
                        onClick={() => switchRole(role)}
                        className={`
                            px-4 py-2 rounded-md text-sm font-medium transition-all
                            ${userProfile.role === role
                                ? 'bg-primary-600 text-white shadow-md transform scale-105'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}
                    >
                        {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
                    </button>
                ))}
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-400 text-center">
                ResQNet Demo Build v1.0
            </div>
        </div>
    );
};

// Main Dashboard Container
const DashboardContainer: React.FC = () => {
    const { userProfile } = useAuth();

    if (!userProfile) return <div className="p-10 text-center">Loading Demo...</div>;

    // Render based on current selected role
    switch (userProfile.role) {
        case 'normal':
            return <NormalUserDashboard />;
        case 'volunteer':
            return <VolunteerDashboard />;
        case 'agency':
            return <AgencyDashboard />;
        default:
            return <div>Unknown Role</div>;
    }
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="relative min-h-screen">
                    <Routes>
                        {/* Direct all traffic to the Dashboard Container */}
                        <Route path="/" element={<DashboardContainer />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>

                    {/* Persistent Role Switcher for Demo */}
                    <DemoRoleSwitcher />
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
