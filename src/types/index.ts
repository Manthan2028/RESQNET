// User roles
export type UserRole = 'normal' | 'volunteer' | 'agency';

// Volunteer categories
export type VolunteerCategory = 'Medical' | 'Rescue' | 'Transport' | 'NGO' | 'General';

// Incident types
export type IncidentType = 'accident' | 'fire' | 'medical' | 'flood' | 'earthquake' | 'other';

// Incident severity
export type IncidentSeverity = 'Low' | 'Medium' | 'High';

// Incident status
export type IncidentStatus = 'pending' | 'verified' | 'in-progress' | 'resolved';

// User interface
export interface User {
    uid: string;
    email: string;
    role: UserRole;
    name: string;
    phone: string;
    city: string;
    createdAt: Date;

    // Volunteer-specific fields
    volunteerCategory?: VolunteerCategory;
    idProofUrl?: string;
    isAvailable?: boolean;

    // Agency-specific fields
    authorityName?: string;
    department?: string;
    region?: string;
}

// Location interface
export interface Location {
    lat: number;
    lng: number;
    address?: string;
}

// Incident update interface
export interface IncidentUpdate {
    id: string;
    timestamp: Date;
    updatedBy: string;
    updatedByRole: UserRole;
    message: string;
    imageUrl?: string;
    status: IncidentStatus;
}

// Incident interface
export interface Incident {
    id: string;
    reportedBy: string;
    reportedByName: string;
    reportedByRole: UserRole;
    city: string;
    type: IncidentType;
    severity: IncidentSeverity;
    location: Location;
    status: IncidentStatus;
    description: string;
    imageUrl?: string;
    videoUrl?: string;
    timestamp: Date;
    updates: IncidentUpdate[];
    assignedVolunteer?: string;
    assignedVolunteerName?: string;
}

// Registration form data
export interface RegistrationData {
    email: string;
    password: string;
    role: UserRole;
    name: string;
    phone: string;
    city: string;

    // Volunteer-specific
    volunteerCategory?: VolunteerCategory;
    idProofFile?: File;

    // Agency-specific
    authorityName?: string;
    department?: string;
    region?: string;
}
