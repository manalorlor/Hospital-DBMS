import React, { useState } from 'react';
import { User, UserRole } from './types';
import { useHospitalData } from './hooks/useHospitalData';
import { Login } from './pages/Login';
import { Layout, MenuItem } from './components/Layout';
import { AdminDashboard } from './pages/AdminDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { PatientPortal } from './pages/PatientPortal';
import { Users, UserPlus, CreditCard, FlaskConical, Package, Calendar, Activity, Settings } from 'lucide-react';

const App: React.FC = () => {
  const { 
    patients, 
    staff,
    doctors, 
    appointments,
    invoices,
    labs,
    inventory,
    notifications,
    loading, 
    addPatient, 
    updatePatient, 
    deletePatient, 
    addDoctor, 
    updateDoctor, 
    deleteDoctor, 
    addMedicalRecord, 
    addAppointment, 
    updateAppointmentStatus, 
    markNotificationAsRead, 
    adminProfile, 
    adminPassword, 
    updateAdminCredentials, 
    INITIAL_ADMIN 
  } = useHospitalData();

  const [user, setUser] = useState<User | null>(null);
  
  // Navigation State
  const [adminTab, setAdminTab] = useState('staff');
  const [doctorTab, setDoctorTab] = useState('directory');

  const adminMenuItems: MenuItem[] = [
    { id: 'staff', label: 'Staff Management', icon: Activity },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'billing', label: 'Billing & Invoices', icon: CreditCard },
    { id: 'labs', label: 'Laboratory', icon: FlaskConical },
    { id: 'pharmacy', label: 'Pharmacy & Inventory', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const doctorMenuItems: MenuItem[] = [
    { id: 'directory', label: 'Patient Directory', icon: Users },
    { id: 'schedule', label: 'My Schedule', icon: Calendar },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-emerald-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Login 
        onLogin={(u) => {
            setUser(u);
            // Reset tabs to default on login
            setAdminTab('staff');
            setDoctorTab('directory');
        }}
        doctors={doctors}
        patients={patients}
        admin={adminProfile}
        adminPassword={adminPassword}
        onRegisterDoctor={addDoctor}
      />
    );
  }

  // Handle Patient View Separately (Different Layout usually, but we can reuse or wrap)
  if (user.role === UserRole.PATIENT) {
      // Find full patient data
      const currentPatientData = patients.find(p => p.id === user.id);
      if (!currentPatientData) return <div>Error loading patient data</div>;

      return (
          <div className="min-h-screen bg-slate-50 p-4 md:p-8">
              <div className="max-w-6xl mx-auto">
                  <header className="flex justify-between items-center mb-8 hidden md:flex">
                      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                          <span className="bg-blue-600 text-white p-2 rounded-lg">AGH</span>
                          Patient Portal
                      </h1>
                      <button onClick={() => setUser(null)} className="text-slate-500 hover:text-slate-800">Sign Out</button>
                  </header>
                  <PatientPortal 
                    user={user}
                    patientData={currentPatientData}
                    appointments={appointments}
                    doctors={doctors}
                    notifications={notifications}
                    onBookAppointment={addAppointment}
                    onCancelAppointment={(id) => updateAppointmentStatus(id, 'Cancelled')}
                    onMarkNotificationAsRead={markNotificationAsRead}
                  />
                  
                  {/* Mobile Sign Out (Header is hidden on mobile inside PatientPortal, so we need a way to sign out) */}
                  <div className="md:hidden mt-8 text-center border-t border-slate-200 pt-4">
                      <button onClick={() => setUser(null)} className="text-red-500 font-medium">Sign Out</button>
                  </div>
              </div>
          </div>
      );
  }

  const isDoctor = user.role === UserRole.DOCTOR;
  const currentMenuItems = isDoctor ? doctorMenuItems : adminMenuItems;
  const currentTab = isDoctor ? doctorTab : adminTab;
  const handleTabChange = isDoctor ? setDoctorTab : setAdminTab;

  return (
    <Layout 
      user={user.role === UserRole.ADMIN ? adminProfile : user} 
      onLogout={() => setUser(null)}
      title={user.role === UserRole.ADMIN ? 'Administrator Portal' : 'Doctor Workstation'}
      notifications={notifications}
      onMarkNotificationAsRead={markNotificationAsRead}
      menuItems={currentMenuItems}
      activeTab={currentTab}
      onTabChange={handleTabChange}
    >
      {user.role === UserRole.ADMIN ? (
        <AdminDashboard 
          activeTab={adminTab}
          doctors={staff} // Admin sees all staff
          patients={patients}
          invoices={invoices}
          labs={labs}
          inventory={inventory}
          onAddDoctor={addDoctor}
          onUpdateDoctor={updateDoctor}
          onDeleteDoctor={deleteDoctor}
          onDeletePatient={deletePatient}
          onUpdatePatient={updatePatient}
          adminProfile={adminProfile}
          onUpdateAdminCredentials={updateAdminCredentials}
        />
      ) : (
        <DoctorDashboard 
          activeTab={doctorTab}
          onTabChange={setDoctorTab}
          user={user}
          doctors={doctors}
          patients={patients}
          appointments={appointments}
          onAddPatient={addPatient}
          onUpdatePatient={updatePatient}
          onAddRecord={addMedicalRecord}
          onUpdateAppointmentStatus={updateAppointmentStatus}
        />
      )}
    </Layout>
  );
};

export default App;