import React, { useState } from 'react';
import { UserRole, User, Patient } from '../types';
import { Activity, Lock, User as UserIcon, ShieldAlert, HeartPulse, Stethoscope, BadgeCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  doctors: User[];
  patients: Patient[];
  admin: User;
  adminPassword?: string;
  onRegisterDoctor: (doctor: Omit<User, 'id' | 'role'>) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, doctors, patients, admin, adminPassword, onRegisterDoctor }) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'patient'>('staff');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'standard' | 'doctor'>('standard');
  
  // Staff Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Doctor Login State
  const [doctorId, setDoctorId] = useState('');
  const [licensureNumber, setLicensureNumber] = useState('');

  // Patient State
  const [patientId, setPatientId] = useState('');
  const [patientContact, setPatientContact] = useState('');
  
  // Registration State
  const [name, setName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [regLicensure, setRegLicensure] = useState('');
  
  const [error, setError] = useState('');

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loginMethod === 'standard') {
        // Admin or General Staff (Password based)
        if (username === admin.username) {
            const validPass = adminPassword || 'admin';
            if (password === validPass) {
                onLogin(admin);
                return;
            } else {
                setError('Invalid admin credentials.');
                return;
            }
        }

        const doc = doctors.find(d => d.username === username);
        if (doc) {
            onLogin(doc);
        } else {
            setError('Staff user not found.');
        }
    } else {
        // Doctor Specific Login (ID + Licensure)
        const doc = doctors.find(d => d.id === doctorId || d.username === doctorId);
        
        if (doc) {
            if (doc.role === UserRole.DOCTOR) {
                 if (doc.licensureNumber === licensureNumber) {
                     onLogin(doc);
                 } else {
                     setError('Invalid Licensure Number.');
                 }
            } else {
                setError('This login method is for Doctors only.');
            }
        } else {
            setError('Doctor ID not found.');
        }
    }
  };

  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const patient = patients.find(p => p.id === patientId && p.contact === patientContact);
    
    if (patient) {
        // Construct a User object for the patient session
        const patientUser: User = {
            id: patient.id,
            username: patient.id,
            name: patient.name,
            role: UserRole.PATIENT
        };
        onLogin(patientUser);
    } else {
        setError('Invalid Patient ID or Contact Number. Please check your details.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !regUsername || !specialization || !regLicensure) {
      setError('All fields are required');
      return;
    }
    
    if (doctors.some(d => d.username === regUsername) || admin.username === regUsername) {
      setError('Username already taken');
      return;
    }

    onRegisterDoctor({
      name,
      username: regUsername,
      specialization,
      licensureNumber: regLicensure
    });
    
    alert(`Registration successful! Your Doctor ID will be generated. Please login with your Username/Password or ID/Licensure.`);
    setIsRegistering(false);
    setUsername(regUsername);
    setPassword('');
    setLoginMethod('standard');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-emerald-700 p-8 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <Activity className="text-white h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">Amasaman Govt Hospital</h1>
          <p className="text-emerald-100 mt-2">Database Management System</p>
        </div>

        <div className="p-8">
            {/* Top Level Tabs */}
            <div className="flex bg-slate-100 rounded-lg p-1 mb-8">
                <button 
                    onClick={() => { setActiveTab('staff'); setIsRegistering(false); setError(''); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'staff' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Staff Portal
                </button>
                <button 
                    onClick={() => { setActiveTab('patient'); setError(''); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'patient' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Patient Portal
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <ShieldAlert size={16} />
                {error}
                </div>
            )}

            {activeTab === 'staff' ? (
                 <>
                    <div className="flex gap-4 mb-6 border-b border-slate-200">
                        <button 
                        className={`flex-1 pb-3 text-sm font-medium transition-colors ${!isRegistering ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500'}`}
                        onClick={() => setIsRegistering(false)}
                        >
                        Login
                        </button>
                        <button 
                        className={`flex-1 pb-3 text-sm font-medium transition-colors ${isRegistering ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500'}`}
                        onClick={() => setIsRegistering(true)}
                        >
                        Doctor Register
                        </button>
                    </div>

                    {!isRegistering ? (
                        <>
                            {/* Sub-toggle for Login Method */}
                            <div className="flex justify-center mb-6">
                                <div className="inline-flex bg-slate-100 rounded-lg p-1">
                                    <button
                                        onClick={() => { setLoginMethod('standard'); setError(''); }}
                                        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${loginMethod === 'standard' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                                    >
                                        Staff / Admin
                                    </button>
                                    <button
                                        onClick={() => { setLoginMethod('doctor'); setError(''); }}
                                        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${loginMethod === 'doctor' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
                                    >
                                        <Stethoscope size={12} /> Doctor Only
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleStaffLogin} className="space-y-4">
                                {loginMethod === 'standard' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                    placeholder="Enter username"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm hover:shadow-md"
                                        >
                                            Sign In
                                        </button>
                                        <p className="text-xs text-center text-slate-400 mt-4">
                                            Default Admin: {admin.username} / {adminPassword || 'admin'}
                                        </p>
                                    </>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
                                        <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100 mb-2">
                                            Please enter your unique Doctor ID and valid Medical Licensure Number to access your workstation.
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Doctor ID</label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={doctorId}
                                                    onChange={(e) => setDoctorId(e.target.value)}
                                                    className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                    placeholder="e.g. doc-1 or username"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Licensure Number</label>
                                            <div className="relative">
                                                <BadgeCheck className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={licensureNumber}
                                                    onChange={(e) => setLicensureNumber(e.target.value)}
                                                    className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                    placeholder="e.g. GMD-2023-001"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                        >
                                            <Stethoscope size={18} /> Access Doctor Portal
                                        </button>
                                        <p className="text-xs text-center text-slate-400 mt-4">
                                            Demo: doc-1 / GMD-23-001
                                        </p>
                                    </div>
                                )}
                            </form>
                        </>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Dr. Full Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                            <input
                            type="text"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="e.g. Cardiology"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Licensure Number</label>
                            <input
                            type="text"
                            value={regLicensure}
                            onChange={(e) => setRegLicensure(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="e.g. GMD-2023-XXX"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Choose Username</label>
                            <input
                            type="text"
                            value={regUsername}
                            onChange={(e) => setRegUsername(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="username"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm hover:shadow-md"
                        >
                            Register & Create Account
                        </button>
                        </form>
                    )}
                 </>
            ) : (
                <form onSubmit={handlePatientLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-2">
                             <HeartPulse className="text-blue-600 h-6 w-6" />
                        </div>
                        <h3 className="text-slate-800 font-medium">Patient Access</h3>
                        <p className="text-xs text-slate-500">Access your records and book appointments</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Patient ID</label>
                        <input
                            type="text"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g. pat-12345"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                        <input
                            type="text"
                            value={patientContact}
                            onChange={(e) => setPatientContact(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Registered phone number"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                    >
                        Access Portal
                    </button>
                    <p className="text-xs text-center text-slate-400 mt-4">
                        Demo: pat-1 / 0244123456
                    </p>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};