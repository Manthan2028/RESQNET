import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, VolunteerCategory, RegistrationData } from '../types';

const Registration: React.FC = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<RegistrationData>>({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleStep1Submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;
        const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setFormData({ ...formData, email, password });
        setError('');
        setStep(2);
    };

    const handleStep2Submit = (role: UserRole) => {
        setFormData({ ...formData, role });
        setStep(3);
    };

    const handleStep3Submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const form = e.currentTarget;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
        const city = (form.elements.namedItem('city') as HTMLInputElement).value;

        const finalData: RegistrationData = {
            ...formData as RegistrationData,
            name,
            phone,
            city
        };

        // Role-specific fields
        if (formData.role === 'volunteer') {
            const category = (form.elements.namedItem('category') as HTMLSelectElement).value as VolunteerCategory;
            const idProofFile = (form.elements.namedItem('idProof') as HTMLInputElement).files?.[0];
            finalData.volunteerCategory = category;
            finalData.idProofFile = idProofFile;
        } else if (formData.role === 'agency') {
            const authorityName = (form.elements.namedItem('authorityName') as HTMLInputElement).value;
            const department = (form.elements.namedItem('department') as HTMLInputElement).value;
            finalData.authorityName = authorityName;
            finalData.department = department;
            finalData.region = city;
        }

        try {
            await register(finalData);
            // Navigation will be handled by App.tsx based on role
        } catch (err: any) {
            setError(err.message || 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
            <div className="card max-w-md w-full">
                <div className="text-center mb-6">
                    <h1 className="text-primary-600 mb-2">ResQNet</h1>
                    <p className="text-gray-600">Crisis Response Platform</p>
                </div>

                {/* Progress indicator */}
                <div className="flex justify-between mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {s}
                            </div>
                            {s < 3 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {/* Step 1: Email & Password */}
                {step === 1 && (
                    <form onSubmit={handleStep1Submit}>
                        <h2 className="mb-4">Create Account</h2>

                        <div className="mb-4">
                            <label className="label">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="input-field"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="label">Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={6}
                                className="input-field"
                                placeholder="Minimum 6 characters"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="label">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                className="input-field"
                                placeholder="Re-enter password"
                            />
                        </div>

                        <button type="submit" className="btn-primary w-full">
                            Continue
                        </button>

                        <p className="text-center mt-4 text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-primary-600 hover:underline font-semibold"
                            >
                                Login
                            </button>
                        </p>
                    </form>
                )}

                {/* Step 2: Role Selection */}
                {step === 2 && (
                    <div>
                        <h2 className="mb-4">Select Your Role</h2>
                        <p className="text-gray-600 mb-6">Choose how you want to use ResQNet</p>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleStep2Submit('normal')}
                                className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
                            >
                                <h3 className="text-lg">Normal User</h3>
                                <p className="text-sm text-gray-600">Report emergencies and track incidents</p>
                            </button>

                            <button
                                onClick={() => handleStep2Submit('volunteer')}
                                className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
                            >
                                <h3 className="text-lg">Volunteer</h3>
                                <p className="text-sm text-gray-600">Respond to incidents and help your community</p>
                            </button>

                            <button
                                onClick={() => handleStep2Submit('agency')}
                                className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
                            >
                                <h3 className="text-lg">Agency / Control Room</h3>
                                <p className="text-sm text-gray-600">Manage and coordinate emergency response</p>
                            </button>
                        </div>

                        <button
                            onClick={() => setStep(1)}
                            className="btn-secondary w-full mt-4"
                        >
                            Back
                        </button>
                    </div>
                )}

                {/* Step 3: Role-specific Details */}
                {step === 3 && (
                    <form onSubmit={handleStep3Submit}>
                        <h2 className="mb-4">Complete Your Profile</h2>

                        {/* Common fields */}
                        <div className="mb-4">
                            <label className="label">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="input-field"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="label">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                className="input-field"
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="label">City</label>
                            <input
                                type="text"
                                name="city"
                                required
                                className="input-field"
                                placeholder="Mumbai"
                            />
                        </div>

                        {/* Volunteer-specific fields */}
                        {formData.role === 'volunteer' && (
                            <>
                                <div className="mb-4">
                                    <label className="label">Volunteer Category</label>
                                    <select name="category" required className="input-field">
                                        <option value="">Select category</option>
                                        <option value="Medical">Medical</option>
                                        <option value="Rescue">Rescue</option>
                                        <option value="Transport">Transport</option>
                                        <option value="NGO">NGO</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="label">ID Proof (Optional for demo)</label>
                                    <input
                                        type="file"
                                        name="idProof"
                                        accept="image/*,.pdf"
                                        className="input-field"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Upload Aadhar, PAN, or any government ID</p>
                                </div>
                            </>
                        )}

                        {/* Agency-specific fields */}
                        {formData.role === 'agency' && (
                            <>
                                <div className="mb-4">
                                    <label className="label">Authority Name</label>
                                    <input
                                        type="text"
                                        name="authorityName"
                                        required
                                        className="input-field"
                                        placeholder="Mumbai Police Control Room"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="label">Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        required
                                        className="input-field"
                                        placeholder="Emergency Response"
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="btn-secondary flex-1"
                                disabled={loading}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="btn-primary flex-1"
                                disabled={loading}
                            >
                                {loading ? 'Creating Account...' : 'Complete Registration'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Registration;
