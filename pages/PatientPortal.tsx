import React, { useState, useMemo } from 'react';
import { User, Patient, Appointment, UserRole, AppNotification } from '../types';
import { Calendar, Clock, MapPin, User as UserIcon, Plus, FileText, Bell, Stethoscope, ArrowRight, History } from 'lucide-react';
import { NotificationBell } from '../components/NotificationBell';

interface PatientPortalProps {
  user: User;
  patientData: Patient; // Full patient object corresponding to the user
  appointments: Appointment[];
  doctors: User[];
  notifications: AppNotification[];
  onBookAppointment: (apt: any) => void;
  onCancelAppointment: (id: string) => void;
  onMarkNotificationAsRead: (id: string) => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({ 
    user, patientData, appointments, doctors, notifications, onBookAppointment, onCancelAppointment, onMarkNotificationAsRead 
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'history'>('appointments');
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  // Booking State
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');

  const userNotifications = notifications.filter(n => n.userId === user.id);

  const myAppointments = appointments.filter(a => a.patientId === user.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcomingAppointments = myAppointments.filter(a => new Date(a.date) > new Date() && a.status !== 'Cancelled');
  const pastAppointments = myAppointments.filter(a => new Date(a.date) <= new Date() || a.status === 'Cancelled');

  // Derive specializations and filtered doctors
  const specializations = useMemo(() => {
    const specs = new Set(doctors.map(d => d.specialization).filter(Boolean));
    return Array.from(specs) as string[];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (!selectedSpecialization) return doctors;
    return doctors.filter(d => d.specialization === selectedSpecialization);
  }, [doctors, selectedSpecialization]);

  const assignedDoctor = useMemo(() => {
    return doctors.find(d => d.id === patientData.assignedDoctorId);
  }, [doctors, patientData.assignedDoctorId]);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const doctor = doctors.find(d => d.id === selectedDoctor);
    if (!doctor || !date || !time) return;

    const appointmentDateTime = new Date(`${date}T${time}`).toISOString();

    onBookAppointment({
        patientId: user.id,
        patientName: user.name,
        doctorId: doctor.id,
        doctorName: doctor.name,
        date: appointmentDateTime,
        reason: reason
    });

    setShowBookingForm(false);
    setSelectedDoctor('');
    setSelectedSpecialization('');
    setDate('');
    setTime('');
    setReason('');
  };

  return (
    <div className="space-y-8 font-sans text-slate-200">
        {/* Mobile/Embedded Header for Portal */}
        <div className="flex justify-between items-center md:hidden mb-4">
            <h2 className="text-xl font-bold text-white">My Health Portal</h2>
             <NotificationBell 
                notifications={userNotifications} 
                onMarkAsRead={onMarkNotificationAsRead} 
             />
        </div>

        {/* Welcome Banner - Futuristic */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden border border-white/10 group">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 opacity-80"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="inline-block bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-cyan-300 mb-3 border border-cyan-500/30 uppercase tracking-widest">Patient Portal</div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{user.name.split(' ')[0]}</span></h2>
                    <p className="text-slate-300 max-w-lg text-lg leading-relaxed opacity-90">Access your digital health records securely.</p>
                    
                    <div className="mt-8 pt-6 border-t border-white/10 inline-block w-full md:w-auto">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Primary Care Physician</p>
                        <div className="flex items-center gap-3 bg-slate-950/50 px-4 py-3 rounded-xl backdrop-blur-sm border border-white/10 hover:border-cyan-500/50 transition-colors cursor-default">
                           <div className="bg-cyan-500/20 p-2 rounded-lg border border-cyan-500/20">
                               <Stethoscope size={20} className="text-cyan-400" />
                           </div>
                           <div>
                               <div className="font-bold text-white">
                                   {assignedDoctor ? assignedDoctor.name : 'Not Assigned'}
                               </div>
                               {assignedDoctor?.specialization && (
                                   <div className="text-xs text-slate-400">
                                       {assignedDoctor.specialization}
                                   </div>
                               )}
                           </div>
                        </div>
                    </div>
                </div>
                <div className="hidden md:block">
                     <div className="bg-slate-950/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
                        <div className="text-center mb-2 text-xs font-bold text-slate-300 uppercase tracking-wider">System Alerts</div>
                        <div className="flex justify-center">
                            <NotificationBell 
                                notifications={userNotifications} 
                                onMarkAsRead={onMarkNotificationAsRead} 
                            />
                        </div>
                     </div>
                </div>
            </div>
            {/* Decorative glows */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-violet-500/10 blur-[80px]"></div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 gap-8">
             <button 
                onClick={() => setActiveTab('appointments')}
                className={`pb-4 text-sm font-bold tracking-wide transition-all relative ${activeTab === 'appointments' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <span className="flex items-center gap-2"><Calendar size={18}/> Appointments</span>
                {activeTab === 'appointments' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] rounded-t-full"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`pb-4 text-sm font-bold tracking-wide transition-all relative ${activeTab === 'history' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <span className="flex items-center gap-2"><History size={18}/> Medical History</span>
                {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] rounded-t-full"></div>}
            </button>
        </div>

        {activeTab === 'appointments' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Upcoming Schedule</h3>
                        <button 
                            onClick={() => setShowBookingForm(true)}
                            className="bg-cyan-600 text-white px-5 py-2.5 rounded-xl hover:bg-cyan-500 transition-all flex items-center gap-2 text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 border border-cyan-400/30"
                        >
                            <Plus size={18} />
                            Book New
                        </button>
                    </div>

                    {showBookingForm && (
                        <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 relative">
                            <button onClick={() => setShowBookingForm(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><Plus size={24} className="rotate-45" /></button>
                            <h4 className="font-bold text-white mb-6 text-lg">Request Appointment</h4>
                            <form onSubmit={handleBook} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 mb-2">Department / Spec.</label>
                                        <div className="relative">
                                            <select 
                                                value={selectedSpecialization} 
                                                onChange={e => {
                                                    setSelectedSpecialization(e.target.value);
                                                    setSelectedDoctor(''); // Reset selected doctor when filter changes
                                                }}
                                                className="w-full p-3 border border-slate-700 rounded-xl bg-slate-950 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all appearance-none text-white"
                                            >
                                                <option value="">All Departments</option>
                                                {specializations.map(spec => (
                                                    <option key={spec} value={spec}>{spec}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-3.5 pointer-events-none text-slate-500"><Calendar size={16}/></div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 mb-2">Preferred Doctor</label>
                                        <div className="relative">
                                            <select 
                                                value={selectedDoctor} 
                                                onChange={e => setSelectedDoctor(e.target.value)}
                                                className="w-full p-3 border border-slate-700 rounded-xl bg-slate-950 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all appearance-none text-white"
                                                required
                                            >
                                                <option value="">Select Doctor</option>
                                                {filteredDoctors.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name} {d.specialization ? `— ${d.specialization}` : ''}</option>
                                                ))}
                                            </select>
                                             <div className="absolute right-3 top-3.5 pointer-events-none text-slate-500"><UserIcon size={16}/></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Reason for Visit</label>
                                    <input 
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        className="w-full p-3 border border-slate-700 rounded-xl bg-slate-950 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-white"
                                        placeholder="Briefly describe your symptoms or reason..."
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 mb-2">Preferred Date</label>
                                        <input 
                                            type="date"
                                            value={date}
                                            onChange={e => setDate(e.target.value)}
                                            className="w-full p-3 border border-slate-700 rounded-xl bg-slate-950 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-white"
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 mb-2">Preferred Time</label>
                                        <input 
                                            type="time"
                                            value={time}
                                            onChange={e => setTime(e.target.value)}
                                            className="w-full p-3 border border-slate-700 rounded-xl bg-slate-950 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-white"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowBookingForm(false)}
                                        className="px-5 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-bold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="px-6 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-all border border-cyan-400/20"
                                    >
                                        Confirm Booking
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-4">
                        {upcomingAppointments.length === 0 ? (
                            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8 text-center">
                                <Calendar size={48} className="text-slate-600 mx-auto mb-3" />
                                <h4 className="text-slate-400 font-bold">No appointments scheduled</h4>
                                <p className="text-slate-600 text-sm mt-1">Book a new appointment to see a doctor.</p>
                            </div>
                        ) : (
                            upcomingAppointments.map(apt => (
                                <div key={apt.id} className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group">
                                    <div className="flex gap-5">
                                        <div className="bg-cyan-950/50 text-cyan-400 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[70px] border border-cyan-500/20">
                                            <span className="text-xs font-bold uppercase tracking-wider">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-2xl font-bold">{new Date(apt.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg mb-1">{apt.reason}</h4>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                                                    <Clock size={16} className="text-cyan-500" />
                                                    {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                                                    <UserIcon size={16} className="text-cyan-500" />
                                                    {apt.doctorName}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onCancelAppointment(apt.id)}
                                        className="text-slate-500 hover:text-red-400 text-sm font-bold px-4 py-2 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20 self-end sm:self-auto opacity-0 group-hover:opacity-100"
                                    >
                                        Cancel Appointment
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Past List (Sidebar style) */}
                <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/5 p-6 h-fit shadow-lg">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                        <History size={20} className="text-slate-400" /> History
                    </h3>
                    <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                         {pastAppointments.length === 0 ? (
                            <p className="text-slate-500 text-sm italic pl-4">No past records found.</p>
                        ) : (
                            pastAppointments.map(apt => (
                                <div key={apt.id} className="relative pl-8">
                                    <div className={`absolute left-[15px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ring-1 ${apt.status === 'Completed' ? 'bg-emerald-400 ring-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-400 ring-red-500/50'}`}></div>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-bold text-slate-300">{new Date(apt.date).toLocaleDateString()}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${apt.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-500 mb-0.5">{apt.doctorName}</p>
                                    <p className="text-xs text-slate-400">{apt.reason}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-xl border border-white/5 overflow-hidden">
                <div className="p-8 border-b border-white/5 bg-slate-950/30">
                    <h3 className="text-xl font-bold text-white">Your Medical Records</h3>
                    <p className="text-slate-400 mt-1">Comprehensive history of diagnosis and prescriptions</p>
                </div>
                <div className="divide-y divide-white/5">
                    {patientData.history.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                            <FileText size={48} className="mb-4 opacity-20" />
                            No medical history available.
                        </div>
                    ) : (
                        patientData.history.map(record => (
                            <div key={record.id} className="p-8 hover:bg-slate-800/30 transition-colors group">
                                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                                    <div>
                                        <h4 className="text-lg font-bold text-emerald-400 mb-1">{record.diagnosis}</h4>
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <span className="bg-slate-800 px-2 py-0.5 rounded text-xs font-bold border border-white/10">Dr. {record.doctorName}</span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-400 bg-slate-950/50 border border-slate-800 px-3 py-1 rounded-lg">{new Date(record.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/20">
                                        <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-2">Prescription</p>
                                        <p className="text-sm text-slate-300 font-medium">{record.prescription}</p>
                                    </div>
                                    <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Clinical Notes</p>
                                        <p className="text-sm text-slate-300 leading-relaxed">{record.notes}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}
    </div>
  );
};