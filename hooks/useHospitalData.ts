import { useState, useEffect } from 'react';
import { Patient, User, UserRole, MedicalRecord, Appointment, Invoice, LabTest, InventoryItem, AppNotification } from '../types';

// --- MOCK DATA ---

const INITIAL_ADMIN: User = {
  id: 'admin-1',
  username: 'admin',
  name: 'System Administrator',
  role: UserRole.ADMIN
};

const INITIAL_STAFF: User[] = [
  { id: 'doc-1', username: 'dr.smith', name: 'Dr. John Smith', role: UserRole.DOCTOR, specialization: 'Cardiology', contact: '0244000001', licensureNumber: 'GMD-23-001' },
  { id: 'doc-2', username: 'dr.doe', name: 'Dr. Jane Doe', role: UserRole.DOCTOR, specialization: 'Pediatrics', contact: '0244000002', licensureNumber: 'GMD-23-002' },
  { id: 'doc-3', username: 'dr.mensah', name: 'Dr. Kwame Mensah', role: UserRole.DOCTOR, specialization: 'General Surgery', contact: '0244000003', licensureNumber: 'GMD-23-003' },
  { id: 'doc-4', username: 'dr.ansah', name: 'Dr. Elizabeth Ansah', role: UserRole.DOCTOR, specialization: 'Neurology', contact: '0244000004', licensureNumber: 'GMD-23-004' },
  { id: 'nur-1', username: 'nur.sarah', name: 'Nurse Sarah Osei', role: UserRole.NURSE, department: 'OPD', contact: '0244000005' },
  { id: 'nur-2', username: 'nur.mike', name: 'Nurse Mike Appiah', role: UserRole.NURSE, department: 'Emergency', contact: '0244000006' },
  { id: 'nur-3', username: 'nur.joyce', name: 'Nurse Joyce Koomson', role: UserRole.NURSE, department: 'Maternity', contact: '0244000007' },
  { id: 'phar-1', username: 'ph.boateng', name: 'Pharm. Kwabena Boateng', role: UserRole.PHARMACIST, department: 'Pharmacy', contact: '0244000008' },
  { id: 'lab-1', username: 'lab.kofi', name: 'Tech. Kofi Annan', role: UserRole.LAB_TECHNICIAN, department: 'Pathology', contact: '0244000009' },
  { id: 'admin-2', username: 'admin.hr', name: 'HR Manager', role: UserRole.ADMIN, department: 'Human Resources', contact: '0244000010' },
];

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Kwame Mensah',
    age: 45,
    gender: 'Male',
    contact: '0244123456',
    address: 'Amasaman, Block B',
    emergencyContactName: 'Adwoa Mensah',
    emergencyContactPhone: '0244111222',
    chronicConditions: 'Hypertension, Type 2 Diabetes',
    assignedDoctorId: 'doc-1',
    createdAt: new Date().toISOString(),
    history: [
      {
        id: 'rec-1',
        date: new Date().toISOString(),
        diagnosis: 'Hypertension',
        prescription: 'Amlodipine 5mg',
        notes: 'Patient reports occasional headaches.',
        doctorId: 'doc-1',
        doctorName: 'Dr. John Smith'
      }
    ]
  },
  {
    id: 'pat-2',
    name: 'Ama Serwaa',
    age: 28,
    gender: 'Female',
    contact: '0500987654',
    address: 'Pokuase, Main St',
    emergencyContactName: 'Kojo Owusu',
    emergencyContactPhone: '0500111222',
    chronicConditions: 'None',
    createdAt: new Date().toISOString(),
    history: []
  },
   { id: 'pat-3', name: 'Kofi Kingston', age: 34, gender: 'Male', contact: '0501112233', address: 'Achimota', createdAt: new Date().toISOString(), history: [] },
   { id: 'pat-4', name: 'Abena Korkor', age: 22, gender: 'Female', contact: '0502223344', address: 'Ofankor', createdAt: new Date().toISOString(), history: [] },
   { id: 'pat-5', name: 'Yaw Sarpong', age: 55, gender: 'Male', contact: '0503334455', address: 'Medie', createdAt: new Date().toISOString(), history: [] },
   { id: 'pat-6', name: 'Esi Mansa', age: 41, gender: 'Female', contact: '0504445566', address: 'Nsawam', createdAt: new Date().toISOString(), history: [] },
   { id: 'pat-7', name: 'Kojo Antwi', age: 60, gender: 'Male', contact: '0505556677', address: 'Amasaman', createdAt: new Date().toISOString(), history: [] },
   { id: 'pat-8', name: 'Akosua Busia', age: 19, gender: 'Female', contact: '0506667788', address: 'Pokuase', createdAt: new Date().toISOString(), history: [] },
   { id: 'pat-9', name: 'Nii Laryea', age: 30, gender: 'Male', contact: '0507778899', address: 'Ga North', createdAt: new Date().toISOString(), history: [] },
   { id: 'pat-10', name: 'Naa Ashorkor', age: 27, gender: 'Female', contact: '0508889900', address: 'Tantra Hill', createdAt: new Date().toISOString(), history: [] }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'pat-1',
    patientName: 'Kwame Mensah',
    doctorId: 'doc-1',
    doctorName: 'Dr. John Smith',
    date: new Date(Date.now() + 86400000).toISOString(),
    reason: 'Regular Checkup',
    status: 'Scheduled'
  }
];

const INITIAL_INVOICES: Invoice[] = [
    { id: 'inv-001', patientId: 'pat-1', patientName: 'Kwame Mensah', date: '2023-10-01', amount: 150.00, status: 'Paid', items: ['Consultation', 'Lab Test'] },
    { id: 'inv-002', patientId: 'pat-2', patientName: 'Ama Serwaa', date: '2023-10-02', amount: 450.00, status: 'Pending', items: ['X-Ray', 'Consultation'] },
    { id: 'inv-003', patientId: 'pat-3', patientName: 'Kofi Kingston', date: '2023-10-03', amount: 75.00, status: 'Paid', items: ['Consultation'] },
    { id: 'inv-004', patientId: 'pat-4', patientName: 'Abena Korkor', date: '2023-10-04', amount: 1200.00, status: 'Overdue', items: ['Surgery Deposit'] },
    { id: 'inv-005', patientId: 'pat-5', patientName: 'Yaw Sarpong', date: '2023-10-05', amount: 200.00, status: 'Paid', items: ['Malaria Test', 'Medication'] },
    { id: 'inv-006', patientId: 'pat-6', patientName: 'Esi Mansa', date: '2023-10-06', amount: 90.00, status: 'Pending', items: ['Consultation'] },
    { id: 'inv-007', patientId: 'pat-7', patientName: 'Kojo Antwi', date: '2023-10-07', amount: 300.00, status: 'Paid', items: ['Dental Checkup'] },
    { id: 'inv-008', patientId: 'pat-8', patientName: 'Akosua Busia', date: '2023-10-08', amount: 550.00, status: 'Pending', items: ['Ultrasound Scan'] },
    { id: 'inv-009', patientId: 'pat-9', patientName: 'Nii Laryea', date: '2023-10-09', amount: 120.00, status: 'Paid', items: ['Blood Test'] },
    { id: 'inv-010', patientId: 'pat-10', patientName: 'Naa Ashorkor', date: '2023-10-10', amount: 800.00, status: 'Overdue', items: ['Ward Fee'] },
];

const INITIAL_LABS: LabTest[] = [
    { id: 'lab-001', patientId: 'pat-1', patientName: 'Kwame Mensah', testName: 'Full Blood Count', date: '2023-10-11', status: 'Completed', requestedBy: 'Dr. John Smith', result: 'Normal' },
    { id: 'lab-002', patientId: 'pat-2', patientName: 'Ama Serwaa', testName: 'Malaria Parasite', date: '2023-10-12', status: 'Pending', requestedBy: 'Dr. Jane Doe' },
    { id: 'lab-003', patientId: 'pat-3', patientName: 'Kofi Kingston', testName: 'Widal Test', date: '2023-10-12', status: 'Completed', requestedBy: 'Dr. John Smith', result: 'Negative' },
    { id: 'lab-004', patientId: 'pat-4', patientName: 'Abena Korkor', testName: 'Lipid Profile', date: '2023-10-13', status: 'In Progress', requestedBy: 'Dr. John Smith' },
    { id: 'lab-005', patientId: 'pat-5', patientName: 'Yaw Sarpong', testName: 'Liver Function Test', date: '2023-10-13', status: 'Completed', requestedBy: 'Dr. Jane Doe', result: 'Elevated Enzymes' },
    { id: 'lab-006', patientId: 'pat-6', patientName: 'Esi Mansa', testName: 'Urinalysis', date: '2023-10-14', status: 'Completed', requestedBy: 'Dr. John Smith', result: 'Trace Protein' },
    { id: 'lab-007', patientId: 'pat-7', patientName: 'Kojo Antwi', testName: 'Blood Sugar (Fasting)', date: '2023-10-14', status: 'Pending', requestedBy: 'Dr. John Smith' },
    { id: 'lab-008', patientId: 'pat-8', patientName: 'Akosua Busia', testName: 'Pregnancy Test', date: '2023-10-15', status: 'Completed', requestedBy: 'Dr. Jane Doe', result: 'Positive' },
    { id: 'lab-009', patientId: 'pat-9', patientName: 'Nii Laryea', testName: 'Hepatitis B Surface Ag', date: '2023-10-15', status: 'Completed', requestedBy: 'Dr. John Smith', result: 'Negative' },
    { id: 'lab-010', patientId: 'pat-10', patientName: 'Naa Ashorkor', testName: 'Thyroid Profile', date: '2023-10-16', status: 'In Progress', requestedBy: 'Dr. Jane Doe' },
];

const INITIAL_INVENTORY: InventoryItem[] = [
    { id: 'inv-001', name: 'Paracetamol 500mg', category: 'Medication', quantity: 5000, unit: 'Tablets', expiryDate: '2025-12-31', status: 'In Stock' },
    { id: 'inv-002', name: 'Amoxicillin 250mg', category: 'Medication', quantity: 2000, unit: 'Capsules', expiryDate: '2024-06-30', status: 'In Stock' },
    { id: 'inv-003', name: 'Disposable Syringes 5ml', category: 'Consumable', quantity: 150, unit: 'Pieces', status: 'Low Stock' },
    { id: 'inv-004', name: 'Surgical Gloves (Medium)', category: 'Consumable', quantity: 1000, unit: 'Pairs', status: 'In Stock' },
    { id: 'inv-005', name: 'Thermometer (Digital)', category: 'Equipment', quantity: 50, unit: 'Units', status: 'In Stock' },
    { id: 'inv-006', name: 'Ibuprofen 400mg', category: 'Medication', quantity: 3000, unit: 'Tablets', expiryDate: '2025-01-15', status: 'In Stock' },
    { id: 'inv-007', name: 'Cotton Wool (500g)', category: 'Consumable', quantity: 20, unit: 'Rolls', status: 'Low Stock' },
    { id: 'inv-008', name: 'Face Masks (N95)', category: 'Consumable', quantity: 0, unit: 'Pieces', status: 'Out of Stock' },
    { id: 'inv-009', name: 'Stethoscope', category: 'Equipment', quantity: 10, unit: 'Units', status: 'In Stock' },
    { id: 'inv-010', name: 'Metformin 500mg', category: 'Medication', quantity: 1200, unit: 'Tablets', expiryDate: '2024-11-30', status: 'In Stock' },
];

export const useHospitalData = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [labs, setLabs] = useState<LabTest[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Admin Credentials State
  const [adminProfile, setAdminProfile] = useState<User>(INITIAL_ADMIN);
  const [adminPassword, setAdminPassword] = useState('admin');

  // Load from LocalStorage on mount
  useEffect(() => {
    const storedPatients = localStorage.getItem('agh_patients');
    const storedStaff = localStorage.getItem('agh_staff');
    const storedAppointments = localStorage.getItem('agh_appointments');
    const storedInvoices = localStorage.getItem('agh_invoices');
    const storedLabs = localStorage.getItem('agh_labs');
    const storedInventory = localStorage.getItem('agh_inventory');
    const storedNotifications = localStorage.getItem('agh_notifications');
    const storedAdmin = localStorage.getItem('agh_admin_profile');
    const storedAdminPass = localStorage.getItem('agh_admin_pass');

    if (storedPatients) {
      setPatients(JSON.parse(storedPatients));
    } else {
      setPatients(INITIAL_PATIENTS);
      localStorage.setItem('agh_patients', JSON.stringify(INITIAL_PATIENTS));
    }

    if (storedStaff) {
      setStaff(JSON.parse(storedStaff));
    } else {
      setStaff(INITIAL_STAFF);
      localStorage.setItem('agh_staff', JSON.stringify(INITIAL_STAFF));
    }

    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments));
    } else {
      setAppointments(INITIAL_APPOINTMENTS);
      localStorage.setItem('agh_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
    }

    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices));
    } else {
        setInvoices(INITIAL_INVOICES);
        localStorage.setItem('agh_invoices', JSON.stringify(INITIAL_INVOICES));
    }

    if (storedLabs) {
        setLabs(JSON.parse(storedLabs));
    } else {
        setLabs(INITIAL_LABS);
        localStorage.setItem('agh_labs', JSON.stringify(INITIAL_LABS));
    }

    if (storedInventory) {
        setInventory(JSON.parse(storedInventory));
    } else {
        setInventory(INITIAL_INVENTORY);
        localStorage.setItem('agh_inventory', JSON.stringify(INITIAL_INVENTORY));
    }

    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    } else {
      setNotifications([]);
    }

    if (storedAdmin) {
        setAdminProfile(JSON.parse(storedAdmin));
    }

    if (storedAdminPass) {
        setAdminPassword(storedAdminPass);
    }

    setLoading(false);
  }, []);

  // Persistence helpers
  const savePatients = (newPatients: Patient[]) => {
    setPatients(newPatients);
    localStorage.setItem('agh_patients', JSON.stringify(newPatients));
  };

  const saveStaff = (newStaff: User[]) => {
    setStaff(newStaff);
    localStorage.setItem('agh_staff', JSON.stringify(newStaff));
  };

  const saveAppointments = (newAppointments: Appointment[]) => {
    setAppointments(newAppointments);
    localStorage.setItem('agh_appointments', JSON.stringify(newAppointments));
  };

  const saveNotifications = (newNotifications: AppNotification[]) => {
    setNotifications(newNotifications);
    localStorage.setItem('agh_notifications', JSON.stringify(newNotifications));
  };

  // Helper to send notifications
  const sendNotification = (userId: string, title: string, message: string, type: AppNotification['type'] = 'info') => {
    const newNotification: AppNotification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId,
      title,
      message,
      date: new Date().toISOString(),
      read: false,
      type
    };
    saveNotifications([newNotification, ...notifications]);
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
  };

  // CRUD Operations
  const addPatient = (patient: Omit<Patient, 'id' | 'createdAt' | 'history'>) => {
    const newPatient: Patient = {
      ...patient,
      id: `pat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      history: []
    };
    savePatients([...patients, newPatient]);
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    const updated = patients.map(p => p.id === id ? { ...p, ...updates } : p);
    savePatients(updated);
  };

  const deletePatient = (id: string) => {
    const filtered = patients.filter(p => p.id !== id);
    savePatients(filtered);
  };

  const addDoctor = (doctor: Omit<User, 'id' | 'role'>) => {
    const newDoctor: User = {
      ...doctor,
      id: `doc-${Date.now()}`,
      role: UserRole.DOCTOR
    };
    saveStaff([...staff, newDoctor]);
  };

  const updateDoctor = (id: string, updates: Partial<User>) => {
    const updated = staff.map(d => d.id === id ? { ...d, ...updates } : d);
    saveStaff(updated);
  };

  const deleteDoctor = (id: string) => {
    const filtered = staff.filter(d => d.id !== id);
    saveStaff(filtered);
  };

  const addMedicalRecord = (patientId: string, record: Omit<MedicalRecord, 'id' | 'date'>) => {
    const updatedPatients = patients.map(p => {
      if (p.id === patientId) {
        const newRecord: MedicalRecord = {
          ...record,
          id: `rec-${Date.now()}`,
          date: new Date().toISOString()
        };
        return { ...p, history: [newRecord, ...p.history] };
      }
      return p;
    });
    savePatients(updatedPatients);
  };

  const addAppointment = (appointment: Omit<Appointment, 'id' | 'status'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: `apt-${Date.now()}`,
      status: 'Scheduled'
    };
    saveAppointments([...appointments, newAppointment]);
    
    // Notify the Doctor
    sendNotification(
      appointment.doctorId,
      'New Appointment Request',
      `${appointment.patientName} has booked an appointment for ${new Date(appointment.date).toLocaleString()}. Reason: ${appointment.reason}`,
      'info'
    );
  };

  const updateAppointmentStatus = (id: string, status: 'Scheduled' | 'Completed' | 'Cancelled') => {
    const appointment = appointments.find(a => a.id === id);
    const updated = appointments.map(a => a.id === id ? { ...a, status } : a);
    saveAppointments(updated);

    if (appointment) {
      // Notify the Patient
      sendNotification(
        appointment.patientId,
        'Appointment Update',
        `Your appointment with ${appointment.doctorName} on ${new Date(appointment.date).toLocaleDateString()} has been ${status}.`,
        status === 'Cancelled' ? 'error' : 'success'
      );
    }
  };

  const updateAdminCredentials = (username: string, password?: string, name?: string) => {
    const newProfile = { ...adminProfile, username, name: name || adminProfile.name };
    setAdminProfile(newProfile);
    localStorage.setItem('agh_admin_profile', JSON.stringify(newProfile));

    if (password) {
      setAdminPassword(password);
      localStorage.setItem('agh_admin_pass', password);
    }
  };

  return {
    patients,
    staff,
    doctors: staff.filter(s => s.role === UserRole.DOCTOR),
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
  };
};