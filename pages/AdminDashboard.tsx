import React, { useState, useEffect } from 'react';
import { User, Patient, UserRole, Invoice, LabTest, InventoryItem } from '../types';
import { UserPlus, Trash2, Users, FileText, Pencil, X, Save, CreditCard, FlaskConical, Stethoscope, Package, Lock, Shield } from 'lucide-react';

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
            chronicConditions: patConditions
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
    <div className="space-y-6">
        {activeTab !== 'settings' && (
            /* Stats Row - Only show on dashboard tabs */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Staff</p>
                        <p className="text-xl font-bold text-slate-800">{doctors.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Patients</p>
                        <p className="text-xl font-bold text-slate-800">{patients.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                        <CreditCard size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Pending Bills</p>
                        <p className="text-xl font-bold text-slate-800">{invoices.filter(i => i.status === 'Pending').length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                        <FlaskConical size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Active Labs</p>
                        <p className="text-xl font-bold text-slate-800">{labs.filter(l => l.status === 'Pending' || l.status === 'In Progress').length}</p>
                    </div>
                </div>
            </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {activeTab === 'staff' && (
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-slate-800">Staff Directory</h3>
                        {!showDocForm && (
                            <button 
                                onClick={() => { resetDocForm(); setShowDocForm(true); }}
                                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm"
                            >
                                <UserPlus size={16} />
                                Add Staff
                            </button>
                        )}
                    </div>

                    {showDocForm && (
                        <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-4 relative">
                             <button onClick={resetDocForm} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                            <h4 className="font-medium mb-4 text-slate-800">{editingDocId ? 'Edit Staff' : 'New Staff Details'}</h4>
                            <form onSubmit={handleSubmitDoctor} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                                    <input value={docName} onChange={e => setDocName(e.target.value)} className="w-full p-2 border rounded-md" required placeholder="Name" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Username</label>
                                    <input value={docUser} onChange={e => setDocUser(e.target.value)} className="w-full p-2 border rounded-md" required placeholder="username" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                                    <select value={docRole} onChange={e => setDocRole(e.target.value as UserRole)} className="w-full p-2 border rounded-md">
                                        <option value={UserRole.DOCTOR}>Doctor</option>
                                        <option value={UserRole.NURSE}>Nurse</option>
                                        <option value={UserRole.PHARMACIST}>Pharmacist</option>
                                        <option value={UserRole.LAB_TECHNICIAN}>Lab Technician</option>
                                        <option value={UserRole.ADMIN}>Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Spec/Dept</label>
                                    <input value={docSpec} onChange={e => setDocSpec(e.target.value)} className="w-full p-2 border rounded-md" placeholder="e.g. Cardiology" />
                                </div>
                                {docRole === UserRole.DOCTOR && (
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Licensure Number</label>
                                        <input value={docLicensure} onChange={e => setDocLicensure(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Licensure No." />
                                    </div>
                                )}
                                <div className="lg:col-span-3 flex justify-end mt-2">
                                    <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700">
                                        {editingDocId ? 'Update Staff' : 'Create Staff'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-800 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Spec/Dept</th>
                                    <th className="px-4 py-3">Username</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {doctors.map(doc => (
                                    <tr key={doc.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-mono text-xs">{doc.id}</td>
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {doc.name}
                                            {doc.licensureNumber && <span className="block text-[10px] text-slate-400 font-normal">Lic: {doc.licensureNumber}</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                doc.role === UserRole.DOCTOR ? 'bg-blue-50 text-blue-700' :
                                                doc.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {doc.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{doc.specialization || doc.department || '-'}</td>
                                        <td className="px-4 py-3">{doc.username}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEditDocClick(doc)}
                                                    className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteDoctor(doc.id)}
                                                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
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
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-slate-800">All Patient Records</h3>
                    </div>

                    {showPatForm && (
                        <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-4 relative">
                             <button onClick={resetPatForm} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                            <h4 className="font-medium mb-4 text-slate-800">Edit Patient Details</h4>
                            <form onSubmit={handleSubmitPatient} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                                    <div className="lg:col-span-2">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                                        <input value={patName} onChange={e => setPatName(e.target.value)} className="w-full p-2 border rounded-md" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Age</label>
                                        <input value={patAge} onChange={e => setPatAge(e.target.value)} type="number" className="w-full p-2 border rounded-md" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Gender</label>
                                        <select value={patGender} onChange={e => setPatGender(e.target.value)} className="w-full p-2 border rounded-md">
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Contact</label>
                                        <input value={patContact} onChange={e => setPatContact(e.target.value)} className="w-full p-2 border rounded-md" required />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Address</label>
                                    <input value={patAddress} onChange={e => setPatAddress(e.target.value)} className="w-full p-2 border rounded-md" required />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Emergency Contact</label>
                                        <input value={patEmergencyName} onChange={e => setPatEmergencyName(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Name" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Emergency Phone</label>
                                        <input value={patEmergencyPhone} onChange={e => setPatEmergencyPhone(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Phone" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Chronic Conditions</label>
                                        <input value={patConditions} onChange={e => setPatConditions(e.target.value)} className="w-full p-2 border rounded-md" placeholder="e.g. Asthma" />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 flex items-center gap-2">
                                        <Save size={16} /> Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-800 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Age/Gender</th>
                                    <th className="px-4 py-3">Contact</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {patients.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                                        <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                                        <td className="px-4 py-3">{p.age} / {p.gender}</td>
                                        <td className="px-4 py-3">{p.contact}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEditPatClick(p)}
                                                    className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                                                    title="Edit Record"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => onDeletePatient(p.id)}
                                                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
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
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-slate-800">Invoices & Billing</h3>
                    </div>
                    <div className="overflow-x-auto">
                         <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-800 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Invoice ID</th>
                                    <th className="px-4 py-3">Patient</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Items</th>
                                    <th className="px-4 py-3">Amount (GHS)</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoices.map(inv => (
                                    <tr key={inv.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-mono text-xs">{inv.id}</td>
                                        <td className="px-4 py-3 font-medium text-slate-900">{inv.patientName}</td>
                                        <td className="px-4 py-3">{inv.date}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{inv.items.join(', ')}</td>
                                        <td className="px-4 py-3 font-medium">₵{inv.amount.toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                inv.status === 'Paid' ? 'bg-green-50 text-green-700' :
                                                inv.status === 'Pending' ? 'bg-yellow-50 text-yellow-700' :
                                                'bg-red-50 text-red-700'
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

            {activeTab === 'settings' && (
                <div className="p-6 max-w-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-slate-800">Admin Account Settings</h3>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        {settingsMsg && (
                            <div className={`mb-4 p-3 text-sm rounded-lg flex items-center gap-2 ${settingsMsg.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <Shield size={16} />
                                {settingsMsg}
                            </div>
                        )}

                        <form onSubmit={handleUpdateSettings} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
                                    <input 
                                        type="text"
                                        value={adminName}
                                        onChange={(e) => setAdminName(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                    <input 
                                        type="text"
                                        value={adminUsername}
                                        onChange={(e) => setAdminUsername(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-lg"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-200">
                                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                    <Lock size={14} /> Change Password (Optional)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">New Password</label>
                                        <input 
                                            type="password"
                                            value={adminNewPass}
                                            onChange={(e) => setAdminNewPass(e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded-lg"
                                            placeholder="Leave blank to keep current"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Confirm New Password</label>
                                        <input 
                                            type="password"
                                            value={adminConfirmPass}
                                            onChange={(e) => setAdminConfirmPass(e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded-lg"
                                            placeholder="Confirm password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 font-medium flex items-center gap-2">
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