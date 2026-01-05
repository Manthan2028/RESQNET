import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, RegistrationData, UserRole } from '../types';

// HACKATHON DEMO MODE
// Authentication is completely disabled.
// This context now serves as a dynamic role switcher.

interface AuthContextType {
    currentUser: any | null; // Mocked
    userProfile: User | null;
    loading: boolean;
    register: (data: RegistrationData) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    // New demo features
    switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Default Mock User Templates
const MOCK_USERS: Record<UserRole, User> = {
    normal: {
        uid: "demo-user-normal",
        email: "citizen@demo.com",
        role: "normal",
        name: "Rahul Sharma",
        phone: "9876543210",
        city: "Mumbai",
        createdAt: new Date()
    },
    volunteer: {
        uid: "demo-user-volunteer",
        email: "volunteer@demo.com",
        role: "volunteer",
        name: "Priya Patel",
        phone: "9876543211",
        city: "Mumbai",
        volunteerCategory: "Medical",
        isAvailable: true,
        createdAt: new Date()
    },
    agency: {
        uid: "demo-user-agency",
        email: "control@demo.com",
        role: "agency",
        name: "Mumbai Control Room",
        phone: "100",
        city: "Mumbai",
        authorityName: "Mumbai Police",
        department: "Emergency Response",
        region: "Mumbai",
        createdAt: new Date()
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentRole, setCurrentRole] = useState<UserRole>('agency'); // Default to Agency
    const [userProfile, setUserProfile] = useState<User | null>(MOCK_USERS['agency']);

    useEffect(() => {
        // Update profile whenever role changes
        setUserProfile(MOCK_USERS[currentRole]);
        console.log(`[DEMO MODE] Switched to role: ${currentRole}`);
    }, [currentRole]);

    // Mock Functions
    const register = async () => console.log("Register disabled in demo mode");
    const login = async () => console.log("Login disabled in demo mode");
    const logout = async () => console.log("Logout disabled in demo mode");

    // Demo Role Switcher
    const switchRole = (role: UserRole) => {
        setCurrentRole(role);
    };

    const value: AuthContextType = {
        currentUser: { uid: userProfile?.uid, email: userProfile?.email },
        userProfile,
        loading: false,
        register,
        login,
        logout,
        switchRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
