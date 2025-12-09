import React, { useState, useMemo, useEffect } from 'react';
import { User, Patient, Appointment } from '../types';
import { Plus, Search, FileText, X, Bot, Stethoscope, Calendar, User as UserIcon, Clock, CheckCircle, Pencil, Save, AlertTriangle, Phone, Filter, ChevronDown, ChevronUp } from 'lucide-react';
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
             <div className={`w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col ${selectedPatientId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-slate-800">Directory</h3>
                      <button 
                      onClick={() => { setIsAddingPatient(true); setSelectedPatientId(null); }}
                      className="p-2 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors"
                      >
                      <Plus size={20} />
                      </button>
                  </div>
                  
                  {/* Search and Filters Toggle */}
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input 
                        type="text" 
                        placeholder="Search name or ID..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg border transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        title="Filter options"
                    >
                        <Filter size={20} />
                    </button>
                  </div>

                  {/* Filter Section */}
                  {showFilters && (
                    <div className="mb-2 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Assigned Doctor</label>
                            <select 
                                value={filterDoctorId}
                                onChange={(e) => setFilterDoctorId(e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded-md text-sm bg-white"
                            >
                                <option value="">All Doctors</option>
                                {doctors.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Start Date (Last Visit)</label>
                                <input 
                                    type="date"
                                    value={filterStartDate}
                                    onChange={(e) => setFilterStartDate(e.target.value)}
                                    className="w-full p-2 border border-slate-200 rounded-md text-sm bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                                <input 
                                    type="date"
                                    value={filterEndDate}
                                    onChange={(e) => setFilterEndDate(e.target.value)}
                                    className="w-full p-2 border border-slate-200 rounded-md text-sm bg-white"
                                />
                            </div>
                        </div>
                        {(filterDoctorId || filterStartDate || filterEndDate || searchTerm) && (
                            <button 
                                onClick={clearFilters}
                                className="text-xs text-red-500 hover:text-red-700 w-full text-center py-1"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                  )}

                </div>
                <div className="flex-1 overflow-y-auto">
                {sortedPatients.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No patients found.</div>
                ) : (
                    sortedPatients.map(patient => (
                    <div 
                        key={patient.id}
                        onClick={() => setSelectedPatientId(patient.id)}
                        className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${selectedPatientId === patient.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-slate-900 truncate pr-2">{patient.name}</h4>
                        <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                            <Calendar size={10} />
                            {getLastDiagnosisDate(patient)}
                        </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                            <span>{patient.gender}, {patient.age} yrs</span>
                            <span className="flex items-center gap-1 text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                <UserIcon size={10} />
                                {getAssignedDoctorName(patient.assignedDoctorId)}
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
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">New Patient Registration</h2>
                    <button onClick={() => setIsAddingPatient(false)} className="text-slate-400 hover:text-slate-600">
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
                    }} className="space-y-4 max-w-lg">
                    {/* ... Existing form fields ... */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input name="name" required className="w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                            <input name="age" type="number" required className="w-full p-2 border rounded-lg" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                            <select name="gender" className="w-full p-2 border rounded-lg">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
                            <input name="contact" required className="w-full p-2 border rounded-lg" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <textarea name="address" required className="w-full p-2 border rounded-lg" rows={3}></textarea>
                    </div>
                    <div className="border-t border-slate-200 pt-4 mt-4">
                        <h4 className="font-semibold text-slate-800 mb-3 text-sm">Additional Information</h4>
                         <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Emergency Contact Name</label>
                                <input name="emergencyContactName" className="w-full p-2 border rounded-lg" placeholder="Next of Kin" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Emergency Phone</label>
                                <input name="emergencyContactPhone" className="w-full p-2 border rounded-lg" placeholder="020..." />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Chronic Conditions (Summary)</label>
                            <input name="chronicConditions" className="w-full p-2 border rounded-lg" placeholder="e.g. Hypertension, Diabetes (comma separated)" />
                        </div>
                    </div>

                    <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 w-full mt-4">Register Patient</button>
                    </form>
                </div>
                ) : selectedPatient ? (
                <div className="flex-1 flex flex-col h-full gap-6">
                    {/* Patient Header Card or Edit Form */}
                    {isEditingPatient ? (
                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-top-4">
                             <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-slate-800">Edit Patient Details</h2>
                                <button onClick={() => setIsEditingPatient(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                             </div>
                             <form onSubmit={handleUpdatePatientForm} className="space-y-4">
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                                         <input name="name" defaultValue={selectedPatient.name} required className="w-full p-2 border rounded-lg text-sm" />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-medium text-slate-500 mb-1">Age</label>
                                         <input name="age" type="number" defaultValue={selectedPatient.age} required className="w-full p-2 border rounded-lg text-sm" />
                                     </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="block text-xs font-medium text-slate-500 mb-1">Gender</label>
                                         <select name="gender" defaultValue={selectedPatient.gender} className="w-full p-2 border rounded-lg text-sm">
                                             <option value="Male">Male</option>
                                             <option value="Female">Female</option>
                                             <option value="Other">Other</option>
                                         </select>
                                     </div>
                                     <div>
                                         <label className="block text-xs font-medium text-slate-500 mb-1">Contact</label>
                                         <input name="contact" defaultValue={selectedPatient.contact} required className="w-full p-2 border rounded-lg text-sm" />
                                     </div>
                                 </div>
                                 <div>
                                     <label className="block text-xs font-medium text-slate-500 mb-1">Address</label>
                                     <input name="address" defaultValue={selectedPatient.address} required className="w-full p-2 border rounded-lg text-sm" />
                                 </div>
                                 
                                 <div className="border-t border-slate-100 pt-3">
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Emergency Contact Name</label>
                                            <input name="emergencyContactName" defaultValue={selectedPatient.emergencyContactName} className="w-full p-2 border rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Emergency Phone</label>
                                            <input name="emergencyContactPhone" defaultValue={selectedPatient.emergencyContactPhone} className="w-full p-2 border rounded-lg text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Chronic Conditions</label>
                                        <input name="chronicConditions" defaultValue={selectedPatient.chronicConditions} className="w-full p-2 border rounded-lg text-sm" />
                                    </div>
                                 </div>

                                 <div className="flex justify-end gap-2">
                                     <button type="button" onClick={() => setIsEditingPatient(false)} className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200">Cancel</button>
                                     <button type="submit" className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"><Save size={16}/> Save Changes</button>
                                 </div>
                             </form>
                         </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-bold text-slate-900">{selectedPatient.name}</h2>
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Active</span>
                                    </div>
                                    <p className="text-slate-500 mt-1 flex items-center gap-4 text-sm">
                                        <span>ID: {selectedPatient.id}</span>
                                        <span>•</span>
                                        <span>{selectedPatient.gender}, {selectedPatient.age} yrs</span>
                                        <span>•</span>
                                        <span>{selectedPatient.contact}</span>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setIsEditingPatient(true)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Edit Details"
                                    >
                                        <Pencil size={20} />
                                    </button>
                                    <button onClick={() => setSelectedPatientId(null)} className="md:hidden text-slate-400">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Enhanced Patient Info */}
                            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                                    <div className="mt-0.5 text-red-500"><AlertTriangle size={18} /></div>
                                    <div>
                                        <p className="font-bold text-red-800 mb-0.5">Chronic Conditions</p>
                                        <p className="text-red-700">{selectedPatient.chronicConditions || 'None listed'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <div className="mt-0.5 text-blue-500"><Phone size={18} /></div>
                                    <div>
                                        <p className="font-bold text-blue-800 mb-0.5">Emergency Contact</p>
                                        <p className="text-blue-700">
                                            <span className="font-medium">{selectedPatient.emergencyContactName || 'N/A'}</span>
                                            {selectedPatient.emergencyContactPhone && <span className="block text-xs opacity-75">{selectedPatient.emergencyContactPhone}</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>

                             <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                <button 
                                onClick={handleGenerateSummary}
                                disabled={loadingAi}
                                className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium border border-purple-100"
                                >
                                <Bot size={18} />
                                {loadingAi ? 'Analyzing...' : 'AI Summary'}
                                </button>
                             </div>
                            {aiSummary && (
                            <div className="mt-4 bg-purple-50 p-4 rounded-lg border border-purple-100 text-sm text-purple-900 animate-in fade-in slide-in-from-top-2">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold flex items-center gap-2"><Bot size={16}/> AI Medical Summary</h4>
                                    <button onClick={() => setAiSummary(null)} className="text-purple-400 hover:text-purple-600"><X size={14}/></button>
                                </div>
                                <div className="prose prose-sm prose-purple max-w-none">
                                    {aiSummary.split('\n').map((line, i) => <p key={i} className="mb-1">{line}</p>)}
                                </div>
                            </div>
                            )}
                        </div>
                    )}

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                        {/* History */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-0">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex justify-between items-center">
                                <h3 className="font-semibold text-slate-800">Medical History</h3>
                                <button 
                                    onClick={() => setShowHistoryFilters(!showHistoryFilters)} 
                                    className={`p-1.5 rounded-lg transition-colors ${showHistoryFilters ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                                >
                                    <Filter size={16} />
                                </button>
                            </div>

                             {/* History Filters */}
                             {showHistoryFilters && (
                                <div className="p-3 bg-slate-50 border-b border-slate-100 animate-in fade-in slide-in-from-top-2 space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search diagnosis, notes..."
                                            value={histSearchTerm}
                                            onChange={(e) => setHistSearchTerm(e.target.value)}
                                            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <select 
                                            value={histDoctorFilter}
                                            onChange={(e) => setHistDoctorFilter(e.target.value)}
                                            className="col-span-1 p-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        >
                                            <option value="">All Doctors</option>
                                            {historyDoctors.map(docName => (
                                                <option key={docName} value={docName}>{docName}</option>
                                            ))}
                                        </select>
                                        <input 
                                            type="date" 
                                            value={histStartDate}
                                            onChange={(e) => setHistStartDate(e.target.value)}
                                            className="col-span-1 p-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            placeholder="Start"
                                        />
                                        <input 
                                            type="date" 
                                            value={histEndDate}
                                            onChange={(e) => setHistEndDate(e.target.value)}
                                            className="col-span-1 p-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            placeholder="End"
                                        />
                                    </div>
                                    {(histSearchTerm || histDoctorFilter || histStartDate || histEndDate) && (
                                        <button 
                                            onClick={() => {
                                                setHistSearchTerm('');
                                                setHistDoctorFilter('');
                                                setHistStartDate('');
                                                setHistEndDate('');
                                            }}
                                            className="w-full text-center text-[10px] text-red-500 hover:underline"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {filteredHistory.length === 0 ? (
                                    <p className="text-slate-400 text-center text-sm py-4">
                                        {selectedPatient.history.length === 0 ? "No medical records yet." : "No records match your filters."}
                                    </p>
                                ) : (
                                    filteredHistory.map(record => (
                                        <div key={record.id} className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-semibold text-emerald-800">{record.diagnosis}</span>
                                                <span className="text-xs text-slate-400">{new Date(record.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs font-medium text-slate-500 mb-1">Dr. {record.doctorName}</p>
                                            <p className="text-sm text-slate-600 mb-2">{record.notes}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Consultation */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                    <Stethoscope size={18} />
                                    New Consultation
                                </h3>
                            </div>
                            <div className="p-4 flex-1 overflow-y-auto">
                                <form onSubmit={handleAddRecord} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Symptoms / Notes</label>
                                        <textarea 
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm h-32"
                                            placeholder="Patient complaints..."
                                            value={newNotes}
                                            onChange={(e) => setNewNotes(e.target.value)}
                                            required
                                        ></textarea>
                                        <button 
                                            type="button"
                                            onClick={handleAiAnalysis}
                                            disabled={!newNotes || loadingAi}
                                            className="mt-2 text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800 disabled:opacity-50"
                                        >
                                            <Bot size={14} />
                                            {loadingAi ? 'Thinking...' : 'Analyze Symptoms with AI'}
                                        </button>
                                    </div>
                                    {aiSuggestion && (
                                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 text-sm">
                                            <div className="flex justify-between">
                                                <h5 className="font-bold text-purple-800 text-xs mb-1">AI Suggestions</h5>
                                                <button type="button" onClick={() => setAiSuggestion(null)}><X size={12} className="text-purple-400"/></button>
                                            </div>
                                            <div className="prose prose-xs prose-purple max-w-none text-slate-700 whitespace-pre-line">
                                                {aiSuggestion}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
                                        <input 
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                            value={newDiagnosis}
                                            onChange={(e) => setNewDiagnosis(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Prescription</label>
                                        <input 
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                            value={newPrescription}
                                            onChange={(e) => setNewPrescription(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium shadow-sm">
                                        Save Record
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <FileText size={32} />
                    </div>
                    <p>Select a patient to view details or start a consultation.</p>
                </div>
                )}
             </div>
          </div>
      ) : (
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-800">Scheduled Appointments</h3>
                  <p className="text-sm text-slate-500">Upcoming appointments for Dr. {user.name}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                  {myAppointments.length === 0 ? (
                      <div className="text-center text-slate-400 mt-10">No appointments scheduled.</div>
                  ) : (
                      <div className="space-y-4 max-w-4xl mx-auto">
                          {myAppointments.map(apt => (
                              <div key={apt.id} className={`flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-xl border ${apt.status === 'Completed' ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-200 shadow-sm'}`}>
                                  <div className="flex gap-4 items-center">
                                      <div className={`p-3 rounded-lg flex flex-col items-center justify-center min-w-[70px] ${apt.status === 'Cancelled' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                          <span className="text-xs font-bold uppercase">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                                          <span className="text-xl font-bold">{new Date(apt.date).getDate()}</span>
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-slate-800 text-lg">{apt.patientName}</h4>
                                          <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                              <span className="flex items-center gap-1"><Clock size={14} /> {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                              <span>•</span>
                                              <span>{apt.reason}</span>
                                          </div>
                                          <div className="mt-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                apt.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 
                                                apt.status === 'Completed' ? 'bg-slate-200 text-slate-600' : 
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {apt.status}
                                            </span>
                                          </div>
                                      </div>
                                  </div>
                                  
                                  {apt.status === 'Scheduled' && (
                                      <div className="flex gap-2 mt-4 md:mt-0 w-full md:w-auto">
                                          <button 
                                            onClick={() => onUpdateAppointmentStatus(apt.id, 'Cancelled')}
                                            className="flex-1 md:flex-none px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium"
                                          >
                                              Cancel
                                          </button>
                                          <button 
                                            onClick={() => {
                                                onUpdateAppointmentStatus(apt.id, 'Completed');
                                                // Pre-select patient to start record
                                                onTabChange('directory');
                                                setSelectedPatientId(apt.patientId);
                                            }}
                                            className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium flex items-center gap-2 justify-center"
                                          >
                                              <CheckCircle size={16} />
                                              Complete
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