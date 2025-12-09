import React, { useState, useMemo } from 'react';
import { User, Patient, Appointment, UserRole, AppNotification } from '../types';
import { Calendar, Clock, MapPin, User as UserIcon, Plus, FileText, Bell, Stethoscope } from 'lucide-react';
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
    <div className="space-y-6">
        {/* Mobile/Embedded Header for Portal */}
        <div className="flex justify-between items-center md:hidden mb-4">
            <h2 className="text-xl font-bold text-slate-800">My Health Portal</h2>
             <NotificationBell 
                notifications={userNotifications} 
                onMarkAsRead={onMarkNotificationAsRead} 
             />
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Welcome, {user.name}</h2>
                    <p className="text-blue-100">Manage your appointments and view medical history securely.</p>
                    
                    <div className="mt-6 pt-4 border-t border-white/20 inline-block">
                        <p className="text-xs uppercase tracking-wider text-blue-200 font-semibold mb-1">Assigned Primary Doctor</p>
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
                           <Stethoscope size={18} className="text-blue-200" />
                           <span className="font-medium text-lg">
                               {assignedDoctor ? assignedDoctor.name : 'Not Assigned'}
                           </span>
                           {assignedDoctor?.specialization && (
                               <span className="text-sm text-blue-200 border-l border-blue-400 pl-2 ml-1">
                                   {assignedDoctor.specialization}
                               </span>
                           )}
                        </div>
                    </div>
                </div>
                <div className="hidden md:block">
                     <div className="bg-white/10 backdrop-blur-md rounded-lg p-2">
                        <NotificationBell 
                            notifications={userNotifications} 
                            onMarkAsRead={onMarkNotificationAsRead} 
                        />
                     </div>
                </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-blue-500/30 blur-2xl"></div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
             <button 
                onClick={() => setActiveTab('appointments')}
                className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'appointments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Appointments
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Medical History
            </button>
        </div>

        {activeTab === 'appointments' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-800">Upcoming Appointments</h3>
                        <button 
                            onClick={() => setShowBookingForm(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
                        >
                            <Plus size={16} />
                            Book Appointment
                        </button>
                    </div>

                    {showBookingForm && (
                        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-4">
                            <h4 className="font-semibold text-slate-800 mb-4">Request New Appointment</h4>
                            <form onSubmit={handleBook} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Specialization</label>
                                        <select 
                                            value={selectedSpecialization} 
                                            onChange={e => {
                                                setSelectedSpecialization(e.target.value);
                                                setSelectedDoctor(''); // Reset selected doctor when filter changes
                                            }}
                                            className="w-full p-2 border border-slate-300 rounded-lg"
                                        >
                                            <option value="">All Specializations</option>
                                            {specializations.map(spec => (
                                                <option key={spec} value={spec}>{spec}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Doctor</label>
                                        <select 
                                            value={selectedDoctor} 
                                            onChange={e => setSelectedDoctor(e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded-lg"
                                            required
                                        >
                                            <option value="">-- Choose Doctor --</option>
                                            {filteredDoctors.map(d => (
                                                <option key={d.id} value={d.id}>{d.name} {d.specialization ? `(${d.specialization})` : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                                    <input 
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-lg"
                                        placeholder="e.g. Checkup, Fever..."
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                        <input 
                                            type="date"
                                            value={date}
                                            onChange={e => setDate(e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded-lg"
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                        <input 
                                            type="time"
                                            value={time}
                                            onChange={e => setTime(e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded-lg"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end pt-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowBookingForm(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Confirm Booking
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-4">
                        {upcomingAppointments.length === 0 ? (
                            <p className="text-slate-500 italic">No upcoming appointments scheduled.</p>
                        ) : (
                            upcomingAppointments.map(apt => (
                                <div key={apt.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex gap-4">
                                        <div className="bg-blue-50 text-blue-600 p-3 rounded-lg flex flex-col items-center justify-center min-w-[60px]">
                                            <span className="text-xs font-bold uppercase">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-xl font-bold">{new Date(apt.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">{apt.reason}</h4>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                <Clock size={14} />
                                                {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                <UserIcon size={14} />
                                                {apt.doctorName}
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onCancelAppointment(apt.id)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Past List (Sidebar style) */}
                <div className="bg-slate-50 rounded-xl p-6 h-fit">
                    <h3 className="font-semibold text-slate-800 mb-4">Past Appointments</h3>
                    <div className="space-y-4">
                         {pastAppointments.length === 0 ? (
                            <p className="text-slate-400 text-sm">No past records.</p>
                        ) : (
                            pastAppointments.map(apt => (
                                <div key={apt.id} className="pb-3 border-b border-slate-200 last:border-0">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-slate-700">{new Date(apt.date).toLocaleDateString()}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${apt.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">{apt.doctorName}</p>
                                    <p className="text-xs text-slate-500">{apt.reason}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800">Your Medical Records</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {patientData.history.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">No medical history available.</div>
                    ) : (
                        patientData.history.map(record => (
                            <div key={record.id} className="p-6 hover:bg-slate-50">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{record.diagnosis}</h4>
                                        <p className="text-sm text-slate-500">Treated by {record.doctorName}</p>
                                    </div>
                                    <span className="text-sm text-slate-400">{new Date(record.date).toLocaleDateString()}</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
                                    <p className="text-sm text-slate-700"><span className="font-semibold">Prescription:</span> {record.prescription}</p>
                                    <p className="text-sm text-slate-600 mt-1"><span className="font-semibold">Notes:</span> {record.notes}</p>
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