import React, { useState, useEffect } from 'react';
import { User, Patient, UserRole, Invoice, LabTest, InventoryItem } from '../types';
import { UserPlus, Trash2, Users, FileText, Pencil, X, Save, CreditCard, FlaskConical, Stethoscope, Package, Lock, Shield, ArrowUpRight, Search, Activity, Zap } from 'lucide-react';

interface AdminDashboardProps {
  activeTab: string;
  doctors: User[]; // Used as 'Staff' here
  patients: Patient[];
  invoices?: Invoice[];
  labs?: LabTest[];
  inventory?: InventoryItem[];
  onAddDoctor: (d: any) => void;
  onUpdateDoctor: (id: string, d: any) => void;
  onDeleteDoctor: (id: string) => void;
  onDeletePatient: (id: string) => void;
  onUpdatePatient: (id: string, p: Partial<Patient>) => void;
  adminProfile?: User;
  onUpdateAdminCredentials?: (username: string, password?: string, name?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  activeTab, doctors, patients, invoices = [], labs = [], inventory = [], onAddDoctor, onUpdateDoctor, onDeleteDoctor, onDeletePatient, onUpdatePatient, adminProfile, onUpdateAdminCredentials
}) => {
  // Doctor/Staff Form State
  const [showDocForm, setShowDocForm] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [docName, setDocName] = useState('');
  const [docUser, setDocUser] = useState('');
  const [docSpec, setDocSpec] = useState('');
  const [docRole, setDocRole] = useState<UserRole>(UserRole.DOCTOR);
  const [docLicensure, setDocLicensure] = useState('');

  // Patient Form State
  const [showPatForm, setShowPatForm] = useState(false);
  const [editingPatId, setEditingPatId] = useState<string | null>(null);
  const [patName, setPatName] = useState('');
  const [patAge, setPatAge] = useState('');
  const [patGender, setPatGender] = useState('Male');
  const [patContact, setPatContact] = useState('');
  const [patAddress, setPatAddress] = useState('');
  const [patEmergencyName, setPatEmergencyName] = useState('');
  const [patEmergencyPhone, setPatEmergencyPhone] = useState('');
  const [patConditions, setPatConditions] = useState('');
  const [patBloodType, setPatBloodType] = useState('');
  const [patAllergies, setPatAllergies] = useState('');

  // Settings State
  const [adminName, setAdminName] = useState(adminProfile?.name || '');
  const [adminUsername, setAdminUsername] = useState(adminProfile?.username || '');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminConfirmPass, setAdminConfirmPass] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');

  useEffect(() => {
    if (adminProfile) {
      setAdminName(adminProfile.name);
      setAdminUsername(adminProfile.username);
    }
  }, [adminProfile]);

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg('');
    
    if (adminNewPass && adminNewPass !== adminConfirmPass) {
        setSettingsMsg('Passwords do not match');
        return;
    }

    if (onUpdateAdminCredentials) {
        onUpdateAdminCredentials(adminUsername, adminNewPass || undefined, adminName);
        setSettingsMsg('Profile updated successfully.');
        setAdminNewPass('');
        setAdminConfirmPass('');
    }
  };

  // Doctor Actions
  const resetDocForm = () => {
      setDocName('');
      setDocUser('');
      setDocSpec('');
      setDocRole(UserRole.DOCTOR);
      setDocLicensure('');
      setEditingDocId(null);
      setShowDocForm(false);
  };

  const handleEditDocClick = (doc: User) => {
      setDocName(doc.name);
      setDocUser(doc.username);
      setDocSpec(doc.specialization || doc.department || '');
      setDocRole(doc.role);
      setDocLicensure(doc.licensureNumber || '');
      setEditingDocId(doc.id);
      setShowDocForm(true);
  };

  const handleSubmitDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
        name: docName,
        username: docUser,
        role: docRole,
        specialization: docRole === UserRole.DOCTOR ? docSpec : undefined,
        department: docRole !== UserRole.DOCTOR ? docSpec : undefined,
        licensureNumber: docRole === UserRole.DOCTOR ? docLicensure : undefined
    };

    if (editingDocId) {
        onUpdateDoctor(editingDocId, data);
    } else {
        onAddDoctor(data);
    }
    resetDocForm();
  };

  const handleDeleteDoctor = (id: string) => {
      if (window.confirm('Are you sure you want to delete this staff account?')) {
          onDeleteDoctor(id);
      }
  };

  // Patient Actions
  const resetPatForm = () => {
    setPatName('');
    setPatAge('');
    setPatGender('Male');
    setPatContact('');
    setPatAddress('');
    setPatEmergencyName('');
    setPatEmergencyPhone('');
    setPatConditions('');
    setPatBloodType('');
    setPatAllergies('');
    setEditingPatId(null);
    setShowPatForm(false);
  };

  const handleEditPatClick = (p: Patient) => {
    setPatName(p.name);
    setPatAge(p.age.toString());
    setPatGender(p.gender);
    setPatContact(p.contact);
    setPatAddress(p.address);
    setPatEmergencyName(p.emergencyContactName || '');
    setPatEmergencyPhone(p.emergencyContactPhone || '');
    setPatConditions(p.chronicConditions || '');
    setPatBloodType(p.bloodType || '');
    setPatAllergies(p.allergies || '');
    setEditingPatId(p.id);
    setShowPatForm(true);
  };

  const handleSubmitPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPatId) {
        onUpdatePatient(editingPatId, {
            name: patName,
            age: parseInt(patAge),
            gender: patGender as any,
            contact: patContact,
            address: patAddress,
            emergencyContactName: patEmergencyName,
            emergencyContactPhone: patEmergencyPhone,
            chronicConditions: patConditions,
            bloodType: patBloodType,
            allergies: patAllergies
        });
        resetPatForm();
    }
  };

  // Reset forms when switching tabs
  useEffect(() => {
    resetDocForm();
    resetPatForm();
    setSettingsMsg('');
  }, [activeTab]);

  return (
    <div className="space-y-8">
        {activeTab !== 'settings' && (
            /* Stats Row */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-blue-500/30 transition-all group relative overflow-hidden shadow-lg">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <Users size={80} className="text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Staff</p>
                        <p className="text-3xl font-bold text-white">{doctors.length}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-300 bg-blue-500/10 w-fit px-2 py-1 rounded border border-blue-500/20">
                        <Activity size={12} />
                        <span>Active Personnel</span>
                    </div>
                </div>
                <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-emerald-500/30 transition-all group relative overflow-hidden shadow-lg">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <FileText size={80} className="text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Patients</p>
                        <p className="text-3xl font-bold text-white">{patients.length}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-300 bg-emerald-500/10 w-fit px-2 py-1 rounded border border-emerald-500/20">
                        <Users size={12} />
                        <span>Registered Records</span>
                    </div>
                </div>
                <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-violet-500/30 transition-all group relative overflow-hidden shadow-lg">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <CreditCard size={80} className="text-violet-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Invoices</p>
                        <p className="text-3xl font-bold text-white">{invoices.filter(i => i.status === 'Pending').length}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-violet-300 bg-violet-500/10 w-fit px-2 py-1 rounded border border-violet-500/20">
                        <Zap size={12} />
                        <span>Awaiting Payment</span>
                    </div>
                </div>
                <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-orange-500/30 transition-all group relative overflow-hidden shadow-lg">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <FlaskConical size={80} className="text-orange-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Lab Tests</p>
                        <p className="text-3xl font-bold text-white">{labs.filter(l => l.status === 'Pending' || l.status === 'In Progress').length}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-orange-300 bg-orange-500/10 w-fit px-2 py-1 rounded border border-orange-500/20">
                        <FlaskConical size={12} />
                        <span>In Queue</span>
                    </div>
                </div>
            </div>
        )}

        {/* Content */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden shadow-2xl min-h-[500px]">
            {activeTab === 'staff' && (
                <div className="p-0">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <div>
                             <h3 className="text-xl font-bold text-white">Staff Directory</h3>
                             <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Manage personnel accounts</p>
                        </div>
                        {!showDocForm && (
                            <button 
                                onClick={() => { resetDocForm(); setShowDocForm(true); }}
                                className="flex items-center gap-2 bg-cyan-600 text-white px-5 py-2.5 rounded-xl hover:bg-cyan-500 transition-all text-sm font-bold shadow-[0_0_15px_rgba(8,145,178,0.4)] active:scale-95 border border-cyan-400/20"
                            >
                                <UserPlus size={18} />
                                Add Staff
                            </button>
                        )}
                    </div>

                    {showDocForm && (
                        <div className="m-6 bg-slate-800/50 p-6 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-4 relative">
                             <button onClick={resetDocForm} className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                            <h4 className="font-bold mb-6 text-white flex items-center gap-2 text-lg">
                                <span className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 border border-emerald-500/30"><UserPlus size={20}/></span>
                                {editingDocId ? 'Edit Staff Member' : 'New Staff Registration'}
                            </h4>
                            <form onSubmit={handleSubmitDoctor} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Full Name</label>
                                    <input value={docName} onChange={e => setDocName(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-white" required placeholder="e.g. Dr. John Doe" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Username</label>
                                    <input value={docUser} onChange={e => setDocUser(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-white" required placeholder="Login username" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Role</label>
                                    <div className="relative">
                                        <select value={docRole} onChange={e => setDocRole(e.target.value as UserRole)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all appearance-none text-white">
                                            <option value={UserRole.DOCTOR}>Doctor</option>
                                            <option value={UserRole.NURSE}>Nurse</option>
                                            <option value={UserRole.PHARMACIST}>Pharmacist</option>
                                            <option value={UserRole.LAB_TECHNICIAN}>Lab Technician</option>
                                            <option value={UserRole.ADMIN}>Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Specialization / Dept</label>
                                    <input value={docSpec} onChange={e => setDocSpec(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-white" placeholder="e.g. Cardiology" />
                                </div>
                                {docRole === UserRole.DOCTOR && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Licensure Number</label>
                                        <input value={docLicensure} onChange={e => setDocLicensure(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-white" placeholder="GMD-..." />
                                    </div>
                                )}
                                <div className="lg:col-span-3 flex justify-end mt-4 pt-4 border-t border-white/5">
                                    <button type="submit" className="bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-500 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-95 border border-emerald-500/20">
                                        {editingDocId ? 'Update Staff Member' : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-white/5 text-slate-400 font-bold uppercase tracking-wider text-xs border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Name & Credentials</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4">Username</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {doctors.map(doc => (
                                    <tr key={doc.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{doc.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white">{doc.name}</div>
                                            {doc.licensureNumber && <div className="text-[10px] text-cyan-400 font-mono mt-1 inline-block border border-cyan-500/20 px-1.5 rounded bg-cyan-500/10">{doc.licensureNumber}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                                                doc.role === UserRole.DOCTOR ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                doc.role === UserRole.ADMIN ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                                                doc.role === UserRole.NURSE ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                                                'bg-slate-700/30 text-slate-400 border-slate-600/30'
                                            }`}>
                                                {doc.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">{doc.specialization || doc.department || '-'}</td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{doc.username}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleEditDocClick(doc)}
                                                    className="text-slate-400 hover:text-blue-400 p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteDoctor(doc.id)}
                                                    className="text-slate-400 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {activeTab === 'patients' && (
                <div className="p-0">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <h3 className="text-xl font-bold text-white">All Patient Records</h3>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Comprehensive database</p>
                    </div>

                    {showPatForm && (
                        <div className="m-6 bg-slate-800/50 p-6 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-4 relative">
                             <button onClick={resetPatForm} className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                            <h4 className="font-bold mb-6 text-white flex items-center gap-2 text-lg">
                                <span className="bg-blue-500/20 p-2 rounded-lg text-blue-400 border border-blue-500/30"><Pencil size={20}/></span>
                                Edit Patient Details
                            </h4>
                            <form onSubmit={handleSubmitPatient} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                                    <div className="lg:col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Full Name</label>
                                        <input value={patName} onChange={e => setPatName(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-white" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Age</label>
                                        <input value={patAge} onChange={e => setPatAge(e.target.value)} type="number" className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-white" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Gender</label>
                                        <select value={patGender} onChange={e => setPatGender(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all appearance-none text-white">
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Contact</label>
                                        <input value={patContact} onChange={e => setPatContact(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-white" required />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Address</label>
                                        <input value={patAddress} onChange={e => setPatAddress(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-white" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Blood Type</label>
                                            <select value={patBloodType} onChange={e => setPatBloodType(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all appearance-none text-white">
                                                <option value="">Unknown</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Allergies</label>
                                            <input value={patAllergies} onChange={e => setPatAllergies(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-white" placeholder="None" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Emergency Contact</label>
                                        <input value={patEmergencyName} onChange={e => setPatEmergencyName(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-white" placeholder="Name" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Emergency Phone</label>
                                        <input value={patEmergencyPhone} onChange={e => setPatEmergencyPhone(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-white" placeholder="Phone" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Chronic Conditions</label>
                                        <input value={patConditions} onChange={e => setPatConditions(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-white" placeholder="e.g. Asthma" />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-white/5">
                                    <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-500 font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all flex items-center gap-2 active:scale-95 border border-blue-500/30">
                                        <Save size={18} /> Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-white/5 text-slate-400 font-bold uppercase tracking-wider text-xs border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Patient Name</th>
                                    <th className="px-6 py-4">Demographics</th>
                                    <th className="px-6 py-4">Contact Info</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {patients.map(p => (
                                    <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{p.id}</td>
                                        <td className="px-6 py-4 font-bold text-white">{p.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-2">
                                                <span className="bg-slate-800 border border-white/10 px-2 py-0.5 rounded text-xs font-bold text-slate-300">{p.gender}</span>
                                                <span className="text-slate-400">{p.age} yrs</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">{p.contact}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleEditPatClick(p)}
                                                    className="text-slate-400 hover:text-blue-400 p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Edit Record"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => onDeletePatient(p.id)}
                                                    className="text-slate-400 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'billing' && (
                <div className="p-0">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <h3 className="text-xl font-bold text-white">Invoices & Billing</h3>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Financial records</p>
                    </div>
                    <div className="overflow-x-auto">
                         <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-white/5 text-slate-400 font-bold uppercase tracking-wider text-xs border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4">Invoice #</th>
                                    <th className="px-6 py-4">Patient</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {invoices.map(inv => (
                                    <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{inv.id}</td>
                                        <td className="px-6 py-4 font-bold text-white">{inv.patientName}</td>
                                        <td className="px-6 py-4 text-slate-400">{inv.date}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{inv.items.join(', ')}</td>
                                        <td className="px-6 py-4 font-mono font-medium text-slate-200">₵{inv.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                                                inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                inv.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'labs' && (
                <div className="p-0">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <h3 className="text-xl font-bold text-white">Laboratory Records</h3>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Diagnostic results</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-white/5 text-slate-400 font-bold uppercase tracking-wider text-xs border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4">Lab ID</th>
                                    <th className="px-6 py-4">Patient Details</th>
                                    <th className="px-6 py-4">Test Name</th>
                                    <th className="px-6 py-4">Requested By</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Outcome</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {labs.map(lab => (
                                    <tr key={lab.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{lab.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white">{lab.patientName}</div>
                                            <div className="text-xs text-slate-500 mt-0.5 flex gap-2">
                                                <span>{lab.patientGender}, {lab.patientAge}y</span>
                                                <span className="text-slate-600">|</span>
                                                <span>{lab.patientContact}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-cyan-100 font-medium">{lab.testName}</td>
                                        <td className="px-6 py-4 text-xs text-slate-400">{lab.requestedBy}</td>
                                        <td className="px-6 py-4 text-slate-400">{lab.date}</td>
                                        <td className="px-6 py-4">
                                            {lab.result ? (
                                                <span className="font-bold text-white bg-slate-800 px-2 py-1 rounded text-xs border border-white/10">{lab.result}</span>
                                            ) : (
                                                <span className="text-slate-500 italic text-xs">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                                                lab.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                lab.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>
                                                {lab.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {activeTab === 'pharmacy' && (
                <div className="p-0">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <h3 className="text-xl font-bold text-white">Pharmacy & Inventory</h3>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Stock management</p>
                    </div>
                    
                    <div className="px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Total Items</p>
                                <p className="text-2xl font-bold text-white mt-1">{inventory.length}</p>
                            </div>
                            <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 shadow-sm"><Package size={20}/></div>
                        </div>
                        <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-red-400 uppercase tracking-wide">Out of Stock</p>
                                <p className="text-2xl font-bold text-white mt-1">{inventory.filter(i => i.status === 'Out of Stock').length}</p>
                            </div>
                             <div className="bg-red-500/20 p-2 rounded-lg text-red-400 shadow-sm"><Shield size={20}/></div>
                        </div>
                        <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-amber-400 uppercase tracking-wide">Low Stock</p>
                                <p className="text-2xl font-bold text-white mt-1">{inventory.filter(i => i.status === 'Low Stock').length}</p>
                            </div>
                             <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400 shadow-sm"><ArrowUpRight size={20}/></div>
                        </div>
                    </div>

                    <div className="overflow-x-auto mt-2">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-white/5 text-slate-400 font-bold uppercase tracking-wider text-xs border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4">Item ID</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Quantity</th>
                                    <th className="px-6 py-4">Expiry Date</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {inventory.map(item => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.id}</td>
                                        <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-800 border border-white/10 text-slate-300 px-2.5 py-1 rounded text-xs font-medium">{item.category}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-200 font-medium">{item.quantity} <span className="text-xs text-slate-500 font-normal ml-1">{item.unit}</span></td>
                                        <td className="px-6 py-4 text-slate-400">{item.expiryDate || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                                                item.status === 'In Stock' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                item.status === 'Low Stock' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="p-8 max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-white">Admin Account Settings</h3>
                        <p className="text-slate-400 mt-2">Manage credentials</p>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-2xl p-8 border border-white/10 shadow-lg backdrop-blur-md">
                        {settingsMsg && (
                            <div className={`mb-6 p-4 text-sm rounded-xl flex items-center gap-3 border ${settingsMsg.includes('success') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                <Shield size={18} />
                                {settingsMsg}
                            </div>
                        )}

                        <form onSubmit={handleUpdateSettings} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Display Name</label>
                                    <input 
                                        type="text"
                                        value={adminName}
                                        onChange={(e) => setAdminName(e.target.value)}
                                        className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Username</label>
                                    <input 
                                        type="text"
                                        value={adminUsername}
                                        onChange={(e) => setAdminUsername(e.target.value)}
                                        className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all text-white"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-white/5">
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <Lock size={16} className="text-emerald-400" /> Security
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">New Password</label>
                                        <input 
                                            type="password"
                                            value={adminNewPass}
                                            onChange={(e) => setAdminNewPass(e.target.value)}
                                            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all text-white"
                                            placeholder="Leave blank to keep current"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Confirm New Password</label>
                                        <input 
                                            type="password"
                                            value={adminConfirmPass}
                                            onChange={(e) => setAdminConfirmPass(e.target.value)}
                                            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all text-white"
                                            placeholder="Confirm password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" className="bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-500 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 transition-all active:scale-95 border border-emerald-500/20">
                                    <Save size={18} /> Update Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};