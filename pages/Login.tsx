import React, { useState } from 'react';
import { UserRole, User, Patient } from '../types';
import { Activity, Lock, User as UserIcon, ShieldAlert, HeartPulse, Stethoscope, BadgeCheck, ArrowRight, ScanLine, Cpu } from 'lucide-react';

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
        setError('Invalid Patient ID or Contact Number.');
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
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-5xl bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex overflow-hidden min-h-[600px] relative z-10">
            
            {/* Visual Side */}
            <div className="hidden lg:flex w-5/12 bg-slate-950 relative flex-col justify-between p-12 border-r border-white/5">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="bg-cyan-500/20 p-2.5 rounded-lg backdrop-blur-md border border-cyan-500/30">
                            <Activity className="h-8 w-8 text-cyan-400" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">AGH <span className="text-cyan-400">OS</span></h1>
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-4xl font-bold leading-tight text-white">
                            Next Gen <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">Healthcare Management</span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Advanced biometrics, real-time diagnostics, and secure patient records powered by AI.
                        </p>
                    </div>
                </div>
                
                <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                        <Cpu className="text-cyan-500 mb-2 h-6 w-6"/>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">System Status</div>
                        <div className="text-emerald-400 font-mono text-sm">Operational</div>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                        <ScanLine className="text-violet-500 mb-2 h-6 w-6"/>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Security</div>
                        <div className="text-white font-mono text-sm">Encrypted</div>
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="w-full lg:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-slate-900/80 to-slate-900/40">
                <div className="max-w-md mx-auto w-full">
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Access Terminal</h3>
                        <p className="text-slate-400 text-sm">Identify yourself to proceed.</p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="grid grid-cols-2 bg-slate-950/50 p-1 rounded-xl mb-8 border border-white/5">
                        <button 
                            onClick={() => { setActiveTab('staff'); setIsRegistering(false); setError(''); }}
                            className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === 'staff' ? 'bg-slate-800 text-white shadow-lg shadow-cyan-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Staff Portal
                        </button>
                        <button 
                            onClick={() => { setActiveTab('patient'); setError(''); }}
                            className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === 'patient' ? 'bg-slate-800 text-cyan-400 shadow-lg shadow-cyan-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Patient Portal
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-950/30 text-red-400 text-sm rounded-xl flex items-start gap-3 border border-red-500/20 animate-in fade-in slide-in-from-top-2">
                            <ShieldAlert size={18} className="mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {activeTab === 'staff' ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex gap-6 mb-6 border-b border-white/10 pb-2">
                                <button 
                                    className={`pb-2 text-sm font-medium transition-all relative ${!isRegistering ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                                    onClick={() => setIsRegistering(false)}
                                >
                                    Login
                                    {!isRegistering && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] rounded-full"></div>}
                                </button>
                                <button 
                                    className={`pb-2 text-sm font-medium transition-all relative ${isRegistering ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                                    onClick={() => setIsRegistering(true)}
                                >
                                    Register
                                    {isRegistering && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] rounded-full"></div>}
                                </button>
                            </div>

                            {!isRegistering ? (
                                <>
                                    <div className="flex gap-2 mb-6">
                                        <button
                                            onClick={() => { setLoginMethod('standard'); setError(''); }}
                                            className={`px-3 py-1.5 text-xs rounded border transition-all ${loginMethod === 'standard' ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-transparent border-slate-700 text-slate-500 hover:border-slate-500'}`}
                                        >
                                            Standard
                                        </button>
                                        <button
                                            onClick={() => { setLoginMethod('doctor'); setError(''); }}
                                            className={`px-3 py-1.5 text-xs rounded border transition-all flex items-center gap-2 ${loginMethod === 'doctor' ? 'bg-violet-500/10 border-violet-500/50 text-violet-400' : 'bg-transparent border-slate-700 text-slate-500 hover:border-slate-500'}`}
                                        >
                                            <Stethoscope size={12} /> Medical ID
                                        </button>
                                    </div>

                                    <form onSubmit={handleStaffLogin} className="space-y-5">
                                        {loginMethod === 'standard' ? (
                                            <>
                                                <div className="group">
                                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">Username</label>
                                                    <div className="relative">
                                                        <UserIcon className="absolute left-3.5 top-3 h-5 w-5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                                                        <input
                                                            type="text"
                                                            value={username}
                                                            onChange={(e) => setUsername(e.target.value)}
                                                            className="pl-11 w-full rounded-xl bg-slate-950/50 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-700"
                                                            placeholder="Enter username"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="group">
                                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">Password</label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                                                        <input
                                                            type="password"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            className="pl-11 w-full rounded-xl bg-slate-950/50 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-700"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-cyan-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                                                >
                                                    Authenticate <ArrowRight size={18} />
                                                </button>
                                                <div className="text-center pt-2">
                                                    <p className="text-xs text-slate-600 font-mono">
                                                        admin / admin
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-5">
                                                <div className="group">
                                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider group-focus-within:text-violet-400 transition-colors">Doctor ID</label>
                                                    <div className="relative">
                                                        <UserIcon className="absolute left-3.5 top-3 h-5 w-5 text-slate-600 group-focus-within:text-violet-400 transition-colors" />
                                                        <input
                                                            type="text"
                                                            value={doctorId}
                                                            onChange={(e) => setDoctorId(e.target.value)}
                                                            className="pl-11 w-full rounded-xl bg-slate-950/50 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-slate-700"
                                                            placeholder="e.g. doc-1"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="group">
                                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider group-focus-within:text-violet-400 transition-colors">Licensure Key</label>
                                                    <div className="relative">
                                                        <BadgeCheck className="absolute left-3.5 top-3 h-5 w-5 text-slate-600 group-focus-within:text-violet-400 transition-colors" />
                                                        <input
                                                            type="text"
                                                            value={licensureNumber}
                                                            onChange={(e) => setLicensureNumber(e.target.value)}
                                                            className="pl-11 w-full rounded-xl bg-slate-950/50 border border-slate-700 px-4 py-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-slate-700"
                                                            placeholder="e.g. GMD-23-001"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-violet-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Stethoscope size={18} /> Verify Credentials
                                                </button>
                                                <p className="text-xs text-center text-slate-600 font-mono">
                                                    doc-1 / GMD-23-001
                                                </p>
                                            </div>
                                        )}
                                    </form>
                                </>
                            ) : (
                                <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full rounded-xl bg-slate-950/50 border border-slate-700 px-4 py-2.5 text-white outline-none focus:border-cyan-500 transition-all"
                                                placeholder="Dr. Name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1">Specialization</label>
                                            <input
                                                type="text"
                                                value={specialization}
                                                onChange={(e) => setSpecialization(e.target.value)}
                                                className="w-full rounded-xl bg-slate-950/50 border border-slate-700 px-4 py-2.5 text-white outline-none focus:border-cyan-500 transition-all"
                                                placeholder="e.g. Surgery"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 mb-1">Licensure #</label>
                                                <input
                                                    type="text"
                                                    value={regLicensure}
                                                    onChange={(e) => setRegLicensure(e.target.value)}
                                                    className="w-full rounded-xl bg-slate-950/50 border border-slate-700 px-4 py-2.5 text-white outline-none focus:border-cyan-500 transition-all"
                                                    placeholder="GMD-..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 mb-1">Username</label>
                                                <input
                                                    type="text"
                                                    value={regUsername}
                                                    onChange={(e) => setRegUsername(e.target.value)}
                                                    className="w-full rounded-xl bg-slate-950/50 border border-slate-700 px-4 py-2.5 text-white outline-none focus:border-cyan-500 transition-all"
                                                    placeholder="User"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white py-3 rounded-xl font-medium transition-all active:scale-[0.98]"
                                    >
                                        Create Account
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handlePatientLogin} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 rounded-full mb-3 ring-1 ring-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                     <HeartPulse className="text-cyan-400 h-8 w-8" />
                                </div>
                                <h3 className="text-white font-semibold text-lg">Patient Access</h3>
                                <p className="text-sm text-slate-400">Securely view your records</p>
                            </div>
                            <div className="group">
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">Patient ID</label>
                                <input
                                    type="text"
                                    value={patientId}
                                    onChange={(e) => setPatientId(e.target.value)}
                                    className="w-full rounded-xl bg-slate-950/50 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-700"
                                    placeholder="e.g. KM3454"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">Contact Number</label>
                                <input
                                    type="text"
                                    value={patientContact}
                                    onChange={(e) => setPatientContact(e.target.value)}
                                    className="w-full rounded-xl bg-slate-950/50 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-700"
                                    placeholder="Phone number"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-cyan-900/20 active:scale-[0.98] transition-all"
                            >
                                Access Portal
                            </button>
                            <p className="text-xs text-center text-slate-600 font-mono">
                                pat-1 / 0244123456
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};