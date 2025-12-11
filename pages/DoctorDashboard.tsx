import React, { useState, useMemo, useEffect } from 'react';
import { User, Patient, Appointment } from '../types';
import { Plus, Search, FileText, X, Bot, Stethoscope, Calendar, User as UserIcon, Clock, CheckCircle, Pencil, Save, AlertTriangle, Phone, Filter, ChevronRight, Activity } from 'lucide-react';
import { suggestDiagnosis, generateMedicalSummary } from '../services/geminiService';

interface DoctorDashboardProps {
  user: User;
  doctors: User[];
  patients: Patient[];
  appointments: Appointment[];
  activeTab: string;
  onTabChange: (id: string) => void;
  onAddPatient: (p: any) => void;
  onUpdatePatient: (id: string, p: Partial<Patient>) => void;
  onAddRecord: (pid: string, r: any) => void;
  onUpdateAppointmentStatus: (id: string, status: 'Scheduled' | 'Completed' | 'Cancelled') => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ 
  user, doctors, patients, appointments, activeTab, onTabChange, onAddPatient, onUpdatePatient, onAddRecord, onUpdateAppointmentStatus 
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  
  // Search and Filter State (Patient Directory)
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDoctorId, setFilterDoctorId] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  // History Filter State (New)
  const [showHistoryFilters, setShowHistoryFilters] = useState(false);
  const [histSearchTerm, setHistSearchTerm] = useState('');
  const [histDoctorFilter, setHistDoctorFilter] = useState('');
  const [histStartDate, setHistStartDate] = useState('');
  const [histEndDate, setHistEndDate] = useState('');

  // New Record State
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newPrescription, setNewPrescription] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // AI State
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  useEffect(() => {
    setIsEditingPatient(false);
    setAiSummary(null);
    setAiSuggestion(null);
    setNewNotes('');
    setNewDiagnosis('');
    setNewPrescription('');
    // Reset history filters when patient changes
    setHistSearchTerm('');
    setHistDoctorFilter('');
    setHistStartDate('');
    setHistEndDate('');
    setShowHistoryFilters(false);
  }, [selectedPatientId]);

  // Filter and Sort Patients
  const sortedPatients = useMemo(() => {
    let filtered = patients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter by Assigned Doctor
    if (filterDoctorId) {
      filtered = filtered.filter(p => p.assignedDoctorId === filterDoctorId);
    }

    // Filter by Date Range (Last Activity)
    if (filterStartDate || filterEndDate) {
      filtered = filtered.filter(p => {
        const lastActivity = p.history.length > 0 ? p.history[0].date : p.createdAt;
        const activityDate = new Date(lastActivity).getTime();

        if (filterStartDate) {
          if (activityDate < new Date(filterStartDate).getTime()) return false;
        }
        if (filterEndDate) {
          // Add one day to include the end date fully (end of day)
          const endDate = new Date(filterEndDate);
          endDate.setHours(23, 59, 59, 999);
          if (activityDate > endDate.getTime()) return false;
        }
        return true;
      });
    }

    return filtered.sort((a, b) => {
      // Get latest activity date (either last history record or creation date)
      const dateA = a.history.length > 0 ? a.history[0].date : a.createdAt;
      const dateB = b.history.length > 0 ? b.history[0].date : b.createdAt;
      
      // Sort descending (newest first)
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [patients, searchTerm, filterDoctorId, filterStartDate, filterEndDate]);

  // Filter Medical History
  const filteredHistory = useMemo(() => {
    if (!selectedPatient) return [];
    
    return selectedPatient.history.filter(record => {
      // Text Search (Diagnosis or Notes)
      if (histSearchTerm) {
        const term = histSearchTerm.toLowerCase();
        const match = 
          record.diagnosis.toLowerCase().includes(term) || 
          record.notes.toLowerCase().includes(term) ||
          record.prescription.toLowerCase().includes(term);
        if (!match) return false;
      }

      // Doctor Filter
      if (histDoctorFilter && record.doctorName !== histDoctorFilter) {
        return false;
      }

      // Date Range
      const recordDate = new Date(record.date).getTime();
      if (histStartDate && recordDate < new Date(histStartDate).getTime()) return false;
      if (histEndDate) {
         const endDate = new Date(histEndDate);
         endDate.setHours(23, 59, 59, 999);
         if (recordDate > endDate.getTime()) return false;
      }

      return true;
    });
  }, [selectedPatient, histSearchTerm, histDoctorFilter, histStartDate, histEndDate]);

  // Get unique doctors from history for filter dropdown
  const historyDoctors = useMemo(() => {
    if (!selectedPatient) return [];
    const docs = new Set(selectedPatient.history.map(h => h.doctorName));
    return Array.from(docs);
  }, [selectedPatient]);

  // Appointments for this doctor
  const myAppointments = useMemo(() => {
      return appointments
        .filter(a => a.doctorId === user.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments, user.id]);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    onAddRecord(selectedPatientId, {
      diagnosis: newDiagnosis,
      prescription: newPrescription,
      notes: newNotes,
      doctorId: user.id,
      doctorName: user.name
    });

    // Reset
    setNewDiagnosis('');
    setNewPrescription('');
    setNewNotes('');
  };

  const handleUpdatePatientForm = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedPatient) return;
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      
      onUpdatePatient(selectedPatient.id, {
        name: formData.get('name') as string,
        age: Number(formData.get('age')),
        gender: formData.get('gender') as any,
        contact: formData.get('contact') as string,
        address: formData.get('address') as string,
        emergencyContactName: formData.get('emergencyContactName') as string,
        emergencyContactPhone: formData.get('emergencyContactPhone') as string,
        chronicConditions: formData.get('chronicConditions') as string,
      });
      setIsEditingPatient(false);
  };

  const handleAiAnalysis = async () => {
    if (!newNotes || !selectedPatient) return;
    setLoadingAi(true);
    setAiSuggestion(null);
    const result = await suggestDiagnosis(newNotes, selectedPatient.age, selectedPatient.gender);
    setAiSuggestion(result);
    setLoadingAi(false);
  };

  const handleGenerateSummary = async () => {
    if (!selectedPatient) return;
    setLoadingAi(true);
    setAiSummary(null);
    const result = await generateMedicalSummary(selectedPatient);
    setAiSummary(result);
    setLoadingAi(false);
  }

  const getAssignedDoctorName = (doctorId?: string) => {
    if (!doctorId) return 'Unassigned';
    const doc = doctors.find(d => d.id === doctorId);
    return doc ? doc.name : 'Unknown';
  };

  const getLastDiagnosisDate = (patient: Patient) => {
    if (patient.history.length === 0) return 'No visits';
    return new Date(patient.history[0].date).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric'
    });
  };

  const clearFilters = () => {
    setFilterDoctorId('');
    setFilterStartDate('');
    setFilterEndDate('');
    setSearchTerm('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {activeTab === 'directory' ? (
          <div className="flex flex-1 gap-6 min-h-0">
             {/* Patient List Column */}
             <div className={`w-full md:w-1/3 bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-2xl border border-white/5 flex flex-col overflow-hidden ${selectedPatientId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-white/5 bg-slate-950/30">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-white tracking-wide">Directory</h3>
                      <button 
                      onClick={() => { setIsAddingPatient(true); setSelectedPatientId(null); }}
                      className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.3)] border border-emerald-500/20"
                      >
                      <Plus size={20} />
                      </button>
                  </div>
                  
                  {/* Search and Filters Toggle */}
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <input 
                        type="text" 
                        placeholder="Search name or ID..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-950/50 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600 text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-xl border transition-colors ${showFilters ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'border-slate-700 bg-slate-950/50 text-slate-400 hover:text-white'}`}
                        title="Filter options"
                    >
                        <Filter size={20} />
                    </button>
                  </div>

                  {/* Filter Section */}
                  {showFilters && (
                    <div className="mb-2 p-3 bg-slate-800/50 rounded-xl border border-white/5 shadow-inner space-y-3 animate-in fade-in slide-in-from-top-2 backdrop-blur-sm">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wide">Assigned Doctor</label>
                            <select 
                                value={filterDoctorId}
                                onChange={(e) => setFilterDoctorId(e.target.value)}
                                className="w-full p-2 border border-slate-600 rounded-lg text-sm bg-slate-900 text-white outline-none focus:border-cyan-500"
                            >
                                <option value="">All Doctors</option>
                                {doctors.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wide">Start Date</label>
                                <input 
                                    type="date"
                                    value={filterStartDate}
                                    onChange={(e) => setFilterStartDate(e.target.value)}
                                    className="w-full p-2 border border-slate-600 rounded-lg text-sm bg-slate-900 text-white outline-none focus:border-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wide">End Date</label>
                                <input 
                                    type="date"
                                    value={filterEndDate}
                                    onChange={(e) => setFilterEndDate(e.target.value)}
                                    className="w-full p-2 border border-slate-600 rounded-lg text-sm bg-slate-900 text-white outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>
                        {(filterDoctorId || filterStartDate || filterEndDate || searchTerm) && (
                            <button 
                                onClick={clearFilters}
                                className="text-xs text-red-400 hover:text-red-300 w-full text-center py-1 font-bold tracking-wide"
                            >
                                CLEAR FILTERS
                            </button>
                        )}
                    </div>
                  )}

                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 bg-black/20">
                {sortedPatients.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center">
                        <Search size={32} className="mb-2 opacity-50"/>
                        No patients found.
                    </div>
                ) : (
                    sortedPatients.map(patient => (
                    <div 
                        key={patient.id}
                        onClick={() => setSelectedPatientId(patient.id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedPatientId === patient.id ? 'bg-cyan-900/20 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-slate-800/30 border-white/5 hover:bg-slate-800/60 hover:border-white/10'}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className={`font-bold text-sm ${selectedPatientId === patient.id ? 'text-cyan-400' : 'text-slate-200'}`}>{patient.name}</h4>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">{patient.id}</p>
                            </div>
                            {selectedPatientId === patient.id && <ChevronRight size={16} className="text-cyan-500"/>}
                        </div>
                        <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-white/5">
                            <span className="text-slate-400 font-medium">{patient.gender}, {patient.age}y</span>
                            <span className="flex items-center gap-1 text-slate-500 bg-black/30 px-2 py-1 rounded-md border border-white/5">
                                <Calendar size={10} />
                                {getLastDiagnosisDate(patient)}
                            </span>
                        </div>
                    </div>
                    ))
                )}
                </div>
             </div>

             {/* Patient Detail / Form Column */}
             <div className={`w-full md:w-2/3 flex flex-col ${!selectedPatientId && !isAddingPatient ? 'hidden md:flex' : 'flex'}`}>
                {isAddingPatient ? (
                <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-2xl border border-white/5 p-8 flex-1 overflow-y-auto">
                    <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                        <div>
                             <h2 className="text-2xl font-bold text-white">New Patient Registration</h2>
                             <p className="text-slate-400 text-sm">Create a new digital health record</p>
                        </div>
                        <button onClick={() => setIsAddingPatient(false)} className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    onAddPatient({
                        name: formData.get('name'),
                        age: Number(formData.get('age')),
                        gender: formData.get('gender'),
                        contact: formData.get('contact'),
                        address: formData.get('address'),
                        emergencyContactName: formData.get('emergencyContactName'),
                        emergencyContactPhone: formData.get('emergencyContactPhone'),
                        chronicConditions: formData.get('chronicConditions'),
                        assignedDoctorId: user.id
                    });
                    setIsAddingPatient(false);
                    }} className="space-y-6 max-w-2xl mx-auto">
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Full Name</label>
                            <input name="name" required className="w-full p-3 border border-slate-700 rounded-xl bg-slate-950 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-white" placeholder="Enter full name" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Age</label>
                            <input name="age" type="number" required className="w-full p-3 border border-slate-700 rounded-xl bg-slate-950 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-white" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Gender</label>
                            <select name="gender" className="w-full p-3 border border-slate-700 rounded-xl bg-slate-950 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-white">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Contact</label>
                            <input name="contact" required className="w-full p-3 border border-slate-700 rounded-xl bg-slate-950 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-white" placeholder="Phone number" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Address</label>
                        <textarea name="address" required className="w-full p-3 border border-slate-700 rounded-xl bg-slate-950 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-white" rows={3} placeholder="Residential address"></textarea>
                    </div>
                    
                    <div className="bg-slate-800/30 p-6 rounded-xl border border-white/5">
                        <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <AlertTriangle size={16} className="text-amber-500"/> Emergency & Medical
                        </h4>
                         <div className="grid grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Emergency Contact Name</label>
                                <input name="emergencyContactName" className="w-full p-3 border border-slate-700 rounded-xl bg-slate-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-white" placeholder="Next of Kin" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Emergency Phone</label>
                                <input name="emergencyContactPhone" className="w-full p-3 border border-slate-700 rounded-xl bg-slate-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-white" placeholder="020..." />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Chronic Conditions</label>
                            <input name="chronicConditions" className="w-full p-3 border border-slate-700 rounded-xl bg-slate-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-white" placeholder="e.g. Hypertension, Diabetes" />
                        </div>
                    </div>

                    <button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl hover:from-emerald-500 hover:to-teal-500 w-full font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all border border-emerald-500/20">Register Patient</button>
                    </form>
                </div>
                ) : selectedPatient ? (
                <div className="flex-1 flex flex-col h-full gap-6">
                    {/* Patient Header Card or Edit Form */}
                    {isEditingPatient ? (
                         <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/5 p-6 animate-in fade-in slide-in-from-top-4">
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Edit Patient Details</h2>
                                <button onClick={() => setIsEditingPatient(false)} className="text-slate-400 hover:text-white p-2 rounded-full"><X size={20}/></button>
                             </div>
                             {/* Reusing styles from add form for update */}
                             <form onSubmit={handleUpdatePatientForm} className="space-y-4">
                                 {/* ... (Fields with dark theme classes similar to add form) ... */}
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="block text-xs font-bold text-slate-400 mb-1">Full Name</label>
                                         <input name="name" defaultValue={selectedPatient.name} required className="w-full p-2 border border-slate-700 bg-slate-950 rounded-lg text-sm focus:border-cyan-500 outline-none text-white" />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-slate-400 mb-1">Age</label>
                                         <input name="age" type="number" defaultValue={selectedPatient.age} required className="w-full p-2 border border-slate-700 bg-slate-950 rounded-lg text-sm focus:border-cyan-500 outline-none text-white" />
                                     </div>
                                 </div>
                                 {/* (rest of fields abbreviated for brevity but follow pattern) */}
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="block text-xs font-bold text-slate-400 mb-1">Gender</label>
                                         <select name="gender" defaultValue={selectedPatient.gender} className="w-full p-2 border border-slate-700 bg-slate-950 rounded-lg text-sm focus:border-cyan-500 outline-none text-white">
                                             <option value="Male">Male</option>
                                             <option value="Female">Female</option>
                                             <option value="Other">Other</option>
                                         </select>
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-slate-400 mb-1">Contact</label>
                                         <input name="contact" defaultValue={selectedPatient.contact} required className="w-full p-2 border border-slate-700 bg-slate-950 rounded-lg text-sm focus:border-cyan-500 outline-none text-white" />
                                     </div>
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-slate-400 mb-1">Address</label>
                                     <input name="address" defaultValue={selectedPatient.address} required className="w-full p-2 border border-slate-700 bg-slate-950 rounded-lg text-sm focus:border-cyan-500 outline-none text-white" />
                                 </div>
                                 
                                 {/* Hidden inputs for less used fields just for demo layout consistency */}
                                 <input type="hidden" name="emergencyContactName" defaultValue={selectedPatient.emergencyContactName} />
                                 <input type="hidden" name="emergencyContactPhone" defaultValue={selectedPatient.emergencyContactPhone} />
                                 <input type="hidden" name="chronicConditions" defaultValue={selectedPatient.chronicConditions} />

                                 <div className="flex justify-end gap-2 pt-2">
                                     <button type="button" onClick={() => setIsEditingPatient(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/10 rounded-lg border border-transparent hover:border-white/10 font-bold">Cancel</button>
                                     <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 flex items-center gap-1 font-bold shadow-lg shadow-emerald-500/20"><Save size={16}/> Save Changes</button>
                                 </div>
                             </form>
                         </div>
                    ) : (
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/5 p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    <div className="h-16 w-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-white/10">
                                        {selectedPatient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{selectedPatient.name}</h2>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                                            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono text-xs border border-white/10">{selectedPatient.id}</span>
                                            <span>•</span>
                                            <span>{selectedPatient.gender}, {selectedPatient.age} years</span>
                                        </div>
                                        <div className="flex gap-4 mt-3">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/50 px-2 py-1 rounded-md border border-white/5">
                                                <Phone size={12} className="text-slate-500"/> {selectedPatient.contact}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/50 px-2 py-1 rounded-md border border-white/5">
                                                <UserIcon size={12} className="text-slate-500"/> Dr. {getAssignedDoctorName(selectedPatient.assignedDoctorId)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setIsEditingPatient(true)}
                                        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-colors border border-transparent hover:border-cyan-500/20"
                                        title="Edit Details"
                                    >
                                        <Pencil size={20} />
                                    </button>
                                    <button onClick={() => setSelectedPatientId(null)} className="md:hidden text-slate-400">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Critical Info Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20 flex items-start gap-3">
                                    <div className="bg-red-500/20 p-2 rounded-full text-red-400 shadow-sm"><AlertTriangle size={18} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-1">Chronic Conditions</p>
                                        <p className="text-sm text-red-200 font-medium">{selectedPatient.chronicConditions || 'None listed'}</p>
                                    </div>
                                </div>
                                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20 flex items-start gap-3">
                                    <div className="bg-blue-500/20 p-2 rounded-full text-blue-400 shadow-sm"><Phone size={18} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1">Emergency Contact</p>
                                        <p className="text-sm text-blue-200 font-medium">
                                            {selectedPatient.emergencyContactName || 'N/A'} 
                                            <span className="text-blue-400/60 font-normal ml-2">{selectedPatient.emergencyContactPhone}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Summary Button area */}
                             <div className="flex items-center justify-between pt-2">
                                <button 
                                onClick={handleGenerateSummary}
                                disabled={loadingAi}
                                className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2 rounded-xl hover:bg-violet-500 transition-all text-sm font-bold shadow-[0_0_15px_rgba(139,92,246,0.3)] active:scale-95 disabled:opacity-70 disabled:scale-100 border border-violet-500/20"
                                >
                                <Bot size={18} />
                                {loadingAi ? 'Analyzing...' : 'Generate AI Summary'}
                                </button>
                             </div>
                            {aiSummary && (
                            <div className="bg-gradient-to-br from-violet-900/30 to-slate-900/30 p-5 rounded-xl border border-violet-500/30 shadow-lg animate-in fade-in slide-in-from-top-2 relative">
                                <div className="flex justify-between items-center mb-3 border-b border-violet-500/20 pb-2">
                                    <h4 className="font-bold text-violet-300 flex items-center gap-2 text-sm"><Bot size={16}/> AI Medical Summary</h4>
                                    <button onClick={() => setAiSummary(null)} className="text-violet-400 hover:text-white"><X size={14}/></button>
                                </div>
                                <div className="prose prose-sm prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
                                    {aiSummary.split('\n').map((line, i) => <p key={i} className="mb-1">{line}</p>)}
                                </div>
                            </div>
                            )}
                        </div>
                    )}

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                        {/* Medical History Column */}
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/5 flex flex-col min-h-0 overflow-hidden">
                            <div className="p-4 border-b border-white/5 bg-slate-950/30 flex justify-between items-center">
                                <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                                    <FileText size={16} className="text-slate-400"/> Medical History
                                </h3>
                                <button 
                                    onClick={() => setShowHistoryFilters(!showHistoryFilters)} 
                                    className={`p-1.5 rounded-lg transition-colors ${showHistoryFilters ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                                >
                                    <Filter size={16} />
                                </button>
                            </div>

                             {/* History Filters */}
                             {showHistoryFilters && (
                                <div className="p-3 bg-slate-800/50 border-b border-white/5 animate-in fade-in slide-in-from-top-2 space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                                        <input 
                                            type="text" 
                                            placeholder="Search diagnosis, notes..."
                                            value={histSearchTerm}
                                            onChange={(e) => setHistSearchTerm(e.target.value)}
                                            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 bg-slate-950 text-white"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                                {filteredHistory.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm py-8">
                                        <FileText size={32} className="mb-2 opacity-20"/>
                                        <p>{selectedPatient.history.length === 0 ? "No medical records yet." : "No records match filters."}</p>
                                    </div>
                                ) : (
                                    filteredHistory.map((record, idx) => (
                                        <div key={record.id} className="relative pl-4 border-l-2 border-slate-700 hover:border-cyan-500 transition-colors pb-4 last:pb-0 group">
                                            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-800 ring-2 ring-slate-600 group-hover:bg-cyan-400 group-hover:ring-cyan-900 transition-all"></div>
                                            <div className="bg-slate-800/40 hover:bg-slate-800/80 p-3 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-white text-sm">{record.diagnosis}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-950/50 border border-white/5 px-1.5 py-0.5 rounded">{new Date(record.date).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1">
                                                    <UserIcon size={10} /> Dr. {record.doctorName}
                                                </p>
                                                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/30 p-2 rounded-lg border border-white/5">
                                                    {record.notes}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Consultation Column */}
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/5 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-white/5 bg-slate-950/30">
                                <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                                    <Stethoscope size={16} className="text-emerald-400"/> New Consultation
                                </h3>
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto">
                                <form onSubmit={handleAddRecord} className="space-y-5 h-full flex flex-col">
                                    <div className="flex-1 min-h-[120px]">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-bold text-slate-400">Clinical Notes</label>
                                            <button 
                                                type="button"
                                                onClick={handleAiAnalysis}
                                                disabled={!newNotes || loadingAi}
                                                className="text-xs flex items-center gap-1.5 text-violet-300 bg-violet-500/10 px-2 py-1 rounded-md hover:bg-violet-500/20 transition-colors disabled:opacity-50 font-bold border border-violet-500/20"
                                            >
                                                <Bot size={14} />
                                                {loadingAi ? 'Thinking...' : 'AI Assist'}
                                            </button>
                                        </div>
                                        <textarea 
                                            className="w-full p-4 border border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none text-sm h-full resize-none bg-slate-950 text-white transition-all placeholder:text-slate-700"
                                            placeholder="Enter patient complaints, observations, and detailed notes..."
                                            value={newNotes}
                                            onChange={(e) => setNewNotes(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>

                                    {aiSuggestion && (
                                        <div className="bg-violet-900/20 p-4 rounded-xl border border-violet-500/30 text-sm animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex justify-between items-center mb-2">
                                                <h5 className="font-bold text-violet-300 text-xs uppercase tracking-wide flex items-center gap-1"><Bot size={14}/> AI Suggestions</h5>
                                                <button type="button" onClick={() => setAiSuggestion(null)}><X size={14} className="text-violet-400 hover:text-white"/></button>
                                            </div>
                                            <div className="prose prose-xs prose-invert max-w-none text-slate-300 whitespace-pre-line leading-relaxed">
                                                {aiSuggestion}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-400 mb-1.5">Diagnosis</label>
                                            <input 
                                                className="w-full p-3 border border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none text-sm bg-slate-950 text-white transition-all"
                                                value={newDiagnosis}
                                                onChange={(e) => setNewDiagnosis(e.target.value)}
                                                placeholder="Primary diagnosis"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-400 mb-1.5">Prescription</label>
                                            <input 
                                                className="w-full p-3 border border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none text-sm bg-slate-950 text-white transition-all"
                                                value={newPrescription}
                                                onChange={(e) => setNewPrescription(e.target.value)}
                                                placeholder="Medications, dosage"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-cyan-600 text-white py-3 rounded-xl hover:bg-cyan-500 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2 border border-cyan-400/20">
                                        <Save size={18} /> Save Medical Record
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 m-4">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5">
                        <UserIcon size={32} className="text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-400">No Patient Selected</h3>
                    <p className="text-sm max-w-xs text-center mt-2 opacity-60">Select a patient from the directory or create a new registration to view details and start a consultation.</p>
                </div>
                )}
             </div>
          </div>
      ) : (
          <div className="flex-1 bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-2xl border border-white/5 overflow-hidden flex flex-col h-full">
              <div className="p-8 border-b border-white/5 bg-slate-950/30">
                  <h3 className="text-2xl font-bold text-white">My Schedule</h3>
                  <p className="text-slate-400 mt-1">Upcoming appointments for Dr. {user.name}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  {myAppointments.length === 0 ? (
                      <div className="text-center text-slate-600 mt-20 flex flex-col items-center">
                          <Calendar size={48} className="mb-4 opacity-20"/>
                          <p>No appointments scheduled.</p>
                      </div>
                  ) : (
                      <div className="space-y-4 max-w-5xl mx-auto">
                          {myAppointments.map(apt => (
                              <div key={apt.id} className={`flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl border transition-all ${apt.status === 'Completed' ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-800/40 border-white/5 hover:border-cyan-500/30 hover:bg-slate-800/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.05)]'}`}>
                                  <div className="flex gap-6 items-center">
                                      <div className={`p-4 rounded-xl flex flex-col items-center justify-center min-w-[80px] ${apt.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                          <span className="text-xs font-bold uppercase tracking-wider">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                                          <span className="text-2xl font-bold">{new Date(apt.date).getDate()}</span>
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-white text-lg">{apt.patientName}</h4>
                                          <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                                              <span className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-md border border-white/5"><Clock size={14} /> {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                              <span className="text-slate-600">|</span>
                                              <span>{apt.reason}</span>
                                          </div>
                                          <div className="mt-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border ${
                                                apt.status === 'Scheduled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                                apt.status === 'Completed' ? 'bg-slate-700/50 text-slate-400 border-slate-600' : 
                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                                {apt.status}
                                            </span>
                                          </div>
                                      </div>
                                  </div>
                                  
                                  {apt.status === 'Scheduled' && (
                                      <div className="flex gap-3 mt-6 md:mt-0 w-full md:w-auto">
                                          <button 
                                            onClick={() => onUpdateAppointmentStatus(apt.id, 'Cancelled')}
                                            className="flex-1 md:flex-none px-5 py-2.5 border border-slate-600 text-slate-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 text-sm font-bold transition-all"
                                          >
                                              Cancel
                                          </button>
                                          <button 
                                            onClick={() => {
                                                onUpdateAppointmentStatus(apt.id, 'Completed');
                                                onTabChange('directory');
                                                setSelectedPatientId(apt.patientId);
                                            }}
                                            className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 text-sm font-bold flex items-center gap-2 justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all active:scale-95 border border-emerald-400/20"
                                          >
                                              <CheckCircle size={18} />
                                              Start Consult
                                          </button>
                                      </div>
                                  )}
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};