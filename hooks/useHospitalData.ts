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
  // Original Staff
  { id: 'doc-1', username: 'dr.boateng', name: 'Dr. Kwaku Boateng', role: UserRole.DOCTOR, specialization: 'Cardiology', contact: '0244000001', licensureNumber: 'GMD-23-001' },
  { id: 'doc-2', username: 'dr.agyapong', name: 'Dr. Akosua Agyapong', role: UserRole.DOCTOR, specialization: 'Pediatrics', contact: '0244000002', licensureNumber: 'GMD-23-002' },
  { id: 'doc-3', username: 'dr.mensah', name: 'Dr. Kwame Mensah', role: UserRole.DOCTOR, specialization: 'General Surgery', contact: '0244000003', licensureNumber: 'GMD-23-003' },
  { id: 'doc-4', username: 'dr.ansah', name: 'Dr. Elizabeth Ansah', role: UserRole.DOCTOR, specialization: 'Neurology', contact: '0244000004', licensureNumber: 'GMD-23-004' },
  { id: 'nur-1', username: 'nur.sarah', name: 'Nurse Sarah Osei', role: UserRole.NURSE, department: 'OPD', contact: '0244000005' },
  { id: 'nur-2', username: 'nur.mike', name: 'Nurse Mike Appiah', role: UserRole.NURSE, department: 'Emergency', contact: '0244000006' },
  { id: 'nur-3', username: 'nur.joyce', name: 'Nurse Joyce Koomson', role: UserRole.NURSE, department: 'Maternity', contact: '0244000007' },
  { id: 'phar-1', username: 'ph.boateng', name: 'Pharm. Kwabena Boateng', role: UserRole.PHARMACIST, department: 'Pharmacy', contact: '0244000008' },
  { id: 'lab-1', username: 'lab.kofi', name: 'Tech. Kofi Annan', role: UserRole.LAB_TECHNICIAN, department: 'Pathology', contact: '0244000009' },
  { id: 'admin-2', username: 'admin.hr', name: 'HR Manager', role: UserRole.ADMIN, department: 'Human Resources', contact: '0244000010' },

  // New Doctors (15)
  { id: 'doc-5', username: 'dr.asante', name: 'Dr. Kofi Asante', role: UserRole.DOCTOR, specialization: 'Cardiology', contact: '0244000011', licensureNumber: 'GMD-23-005' },
  { id: 'doc-6', username: 'dr.osei', name: 'Dr. Abena Osei', role: UserRole.DOCTOR, specialization: 'Pediatrics', contact: '0244000012', licensureNumber: 'GMD-23-006' },
  { id: 'doc-7', username: 'dr.boakye', name: 'Dr. Yaw Boakye', role: UserRole.DOCTOR, specialization: 'Neurology', contact: '0244000013', licensureNumber: 'GMD-23-007' },
  { id: 'doc-8', username: 'dr.mensaha', name: 'Dr. Akua Mensah', role: UserRole.DOCTOR, specialization: 'General Surgery', contact: '0244000014', licensureNumber: 'GMD-23-008' },
  { id: 'doc-9', username: 'dr.appiah', name: 'Dr. Kwabena Appiah', role: UserRole.DOCTOR, specialization: 'Orthopedics', contact: '0244000015', licensureNumber: 'GMD-23-009' },
  { id: 'doc-10', username: 'dr.owusu', name: 'Dr. Ama Owusu', role: UserRole.DOCTOR, specialization: 'Dermatology', contact: '0244000016', licensureNumber: 'GMD-23-010' },
  { id: 'doc-11', username: 'dr.acheampong', name: 'Dr. Kwaku Acheampong', role: UserRole.DOCTOR, specialization: 'Internal Medicine', contact: '0244000017', licensureNumber: 'GMD-23-011' },
  { id: 'doc-12', username: 'dr.addo', name: 'Dr. Adwoa Addo', role: UserRole.DOCTOR, specialization: 'Gynecology', contact: '0244000018', licensureNumber: 'GMD-23-012' },
  { id: 'doc-13', username: 'dr.obeng', name: 'Dr. Samuel Obeng', role: UserRole.DOCTOR, specialization: 'Psychiatry', contact: '0244000019', licensureNumber: 'GMD-23-013' },
  { id: 'doc-14', username: 'dr.yeboah', name: 'Dr. Esther Yeboah', role: UserRole.DOCTOR, specialization: 'Ophthalmology', contact: '0244000020', licensureNumber: 'GMD-23-014' },
  { id: 'doc-15', username: 'dr.danso', name: 'Dr. Isaac Danso', role: UserRole.DOCTOR, specialization: 'ENT', contact: '0244000021', licensureNumber: 'GMD-23-015' },
  { id: 'doc-16', username: 'dr.antwi', name: 'Dr. Mary Antwi', role: UserRole.DOCTOR, specialization: 'Oncology', contact: '0244000022', licensureNumber: 'GMD-23-016' },
  { id: 'doc-17', username: 'dr.sarfo', name: 'Dr. Emmanuel Sarfo', role: UserRole.DOCTOR, specialization: 'Urology', contact: '0244000023', licensureNumber: 'GMD-23-017' },
  { id: 'doc-18', username: 'dr.badu', name: 'Dr. Grace Badu', role: UserRole.DOCTOR, specialization: 'Radiology', contact: '0244000024', licensureNumber: 'GMD-23-018' },
  { id: 'doc-19', username: 'dr.tetteh', name: 'Dr. John Tetteh', role: UserRole.DOCTOR, specialization: 'Anesthesiology', contact: '0244000025', licensureNumber: 'GMD-23-019' },

  // New Nurses (15)
  { id: 'nur-4', username: 'nur.laryea', name: 'Nurse Afia Laryea', role: UserRole.NURSE, department: 'OPD', contact: '0244000026' },
  { id: 'nur-5', username: 'nur.quartey', name: 'Nurse Kwesi Quartey', role: UserRole.NURSE, department: 'Emergency', contact: '0244000027' },
  { id: 'nur-6', username: 'nur.lamptey', name: 'Nurse Yaa Lamptey', role: UserRole.NURSE, department: 'Maternity', contact: '0244000028' },
  { id: 'nur-7', username: 'nur.tagoe', name: 'Nurse Ebenezer Tagoe', role: UserRole.NURSE, department: 'Surgical Ward', contact: '0244000029' },
  { id: 'nur-8', username: 'nur.nartey', name: 'Nurse Beatrice Nartey', role: UserRole.NURSE, department: 'Pediatric Ward', contact: '0244000030' },
  { id: 'nur-9', username: 'nur.baah', name: 'Nurse Francis Baah', role: UserRole.NURSE, department: 'ICU', contact: '0244000031' },
  { id: 'nur-10', username: 'nur.bediako', name: 'Nurse Felicia Bediako', role: UserRole.NURSE, department: 'OPD', contact: '0244000032' },
  { id: 'nur-11', username: 'nur.coffie', name: 'Nurse Daniel Coffie', role: UserRole.NURSE, department: 'Emergency', contact: '0244000033' },
  { id: 'nur-12', username: 'nur.eshun', name: 'Nurse Hannah Eshun', role: UserRole.NURSE, department: 'Maternity', contact: '0244000034' },
  { id: 'nur-13', username: 'nur.frimpong', name: 'Nurse George Frimpong', role: UserRole.NURSE, department: 'General Ward', contact: '0244000035' },
  { id: 'nur-14', username: 'nur.gyasi', name: 'Nurse Juliet Gyasi', role: UserRole.NURSE, department: 'OPD', contact: '0244000036' },
  { id: 'nur-15', username: 'nur.agyeman', name: 'Nurse Patrick Agyeman', role: UserRole.NURSE, department: 'Emergency', contact: '0244000037' },
  { id: 'nur-16', username: 'nur.kyei', name: 'Nurse Rita Kyei', role: UserRole.NURSE, department: 'Surgical Ward', contact: '0244000038' },
  { id: 'nur-17', username: 'nur.nkrumah', name: 'Nurse Stephen Nkrumah', role: UserRole.NURSE, department: 'ICU', contact: '0244000039' },
  { id: 'nur-18', username: 'nur.addae', name: 'Nurse Theresa Addae', role: UserRole.NURSE, department: 'Maternity', contact: '0244000040' },

  // New Pharmacists (5)
  { id: 'phar-2', username: 'ph.ofori', name: 'Pharm. Joseph Ofori', role: UserRole.PHARMACIST, department: 'Pharmacy', contact: '0244000041' },
  { id: 'phar-3', username: 'ph.amponsah', name: 'Pharm. Rebecca Amponsah', role: UserRole.PHARMACIST, department: 'Pharmacy', contact: '0244000042' },
  { id: 'phar-4', username: 'ph.nyarko', name: 'Pharm. David Nyarko', role: UserRole.PHARMACIST, department: 'Pharmacy', contact: '0244000043' },
  { id: 'phar-5', username: 'ph.donkor', name: 'Pharm. Sarah Donkor', role: UserRole.PHARMACIST, department: 'Pharmacy', contact: '0244000044' },
  { id: 'phar-6', username: 'ph.asare', name: 'Pharm. Michael Asare', role: UserRole.PHARMACIST, department: 'Pharmacy', contact: '0244000045' },

  // New Lab Technicians (5)
  { id: 'lab-2', username: 'lab.sarpong', name: 'Tech. Richard Sarpong', role: UserRole.LAB_TECHNICIAN, department: 'Hematology', contact: '0244000046' },
  { id: 'lab-3', username: 'lab.opoku', name: 'Tech. Jennifer Opoku', role: UserRole.LAB_TECHNICIAN, department: 'Microbiology', contact: '0244000047' },
  { id: 'lab-4', username: 'lab.darko', name: 'Tech. Charles Darko', role: UserRole.LAB_TECHNICIAN, department: 'Biochemistry', contact: '0244000048' },
  { id: 'lab-5', username: 'lab.agyapong', name: 'Tech. Linda Agyapong', role: UserRole.LAB_TECHNICIAN, department: 'Pathology', contact: '0244000049' },
  { id: 'lab-6', username: 'lab.kwarteng', name: 'Tech. Peter Kwarteng', role: UserRole.LAB_TECHNICIAN, department: 'Serology', contact: '0244000050' },
];

const generateMockPatients = (count: number): Patient[] => {
  const firstNames = ['Kwame', 'Kofi', 'Yaw', 'Akwasi', 'Kwabena', 'Kojo', 'Kwesi', 'Kwadwo', 'John', 'Emmanuel', 'Samuel', 'Isaac', 'Adwoa', 'Abena', 'Akua', 'Yaa', 'Afia', 'Ama', 'Akosua', 'Esi', 'Mary', 'Sarah', 'Elizabeth', 'Grace', 'Faustina', 'Juliana', 'Comfort', 'Patience', 'Stephen', 'Daniel', 'Joseph', 'Peter', 'Paul', 'Matthew', 'Mark', 'Luke', 'Hannah', 'Esther', 'Ruth', 'Naomi', 'Deborah'];
  const lastNames = ['Mensah', 'Osei', 'Asante', 'Appiah', 'Owusu', 'Boateng', 'Antwi', 'Sarpong', 'Acheampong', 'Fosu', 'Badu', 'Agyemang', 'Boakye', 'Opoku', 'Darko', 'Kyei', 'Yeboah', 'Ansah', 'Nartey', 'Tetteh', 'Laryea', 'Quartey', 'Lamptey', 'Addo', 'Dadzie', 'Eshun', 'Aggrey', 'Frimpong', 'Gyasi', 'Amponsah', 'Nyarko', 'Ofori', 'Djan', 'Sowah', 'Tagoe', 'Annan', 'Armah'];
  const locations = ['Amasaman', 'Pokuase', 'Achimota', 'Medie', 'Nsawam', 'Ofankor', 'Tantra Hill', 'Ga North', 'Kotoku', 'Sarpeiman', 'Dome', 'Kwabenya', 'Adenta', 'Madina', 'Legon', 'Spintex', 'Tesano', 'Alajo', 'Circle'];
  const conditions = ['Hypertension', 'Type 2 Diabetes', 'Malaria', 'Asthma', 'Peptic Ulcer', 'Sickle Cell', 'None', 'None', 'None', 'None', 'None', 'Arthritis', 'Glaucoma'];
  const allergies = ['None', 'None', 'None', 'None', 'Penicillin', 'Peanuts', 'Dust', 'Pollen', 'Shellfish', 'Sulfa Drugs', 'Latex'];
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return Array.from({ length: count }).map((_, i) => {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    // Simple gender guess based on Akan names or standard lists, roughly
    const isMale = ['Kwame', 'Kofi', 'Yaw', 'Akwasi', 'Kwabena', 'Kojo', 'Kwesi', 'Kwadwo', 'John', 'Emmanuel', 'Samuel', 'Isaac', 'Stephen', 'Daniel', 'Joseph', 'Peter', 'Paul', 'Matthew', 'Mark', 'Luke'].includes(fn);
    const gender = isMale ? 'Male' : 'Female';
    
    // ID Format: Initials + 4 digits
    const initials = (fn[0] + ln[0]).toUpperCase();
    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const id = `${initials}${uniqueNum}`; 

    return {
        id,
        name: `${fn} ${ln}`,
        age: Math.floor(1 + Math.random() * 90),
        gender: gender as 'Male' | 'Female',
        contact: `0${Math.floor(233000000 + Math.random() * 700000000).toString().substring(0, 9)}`,
        address: locations[Math.floor(Math.random() * locations.length)],
        emergencyContactName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${ln}`,
        emergencyContactPhone: `0${Math.floor(233000000 + Math.random() * 700000000).toString().substring(0, 9)}`,
        chronicConditions: conditions[Math.floor(Math.random() * conditions.length)],
        bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
        allergies: allergies[Math.floor(Math.random() * allergies.length)],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 31536000000)).toISOString(),
        history: []
    };
  });
};

const MANUAL_PATIENTS: Patient[] = [
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
    bloodType: 'O+',
    allergies: 'Penicillin, Peanuts',
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
    bloodType: 'A-',
    allergies: 'None',
    createdAt: new Date().toISOString(),
    history: []
  },
   { id: 'pat-3', name: 'Kofi Kingston', age: 34, gender: 'Male', contact: '0501112233', address: 'Achimota', bloodType: 'B+', allergies: 'Shellfish', createdAt: new Date().toISOString(), history: [] },
   { id: 'pat-4', name: 'Abena Korkor', age: 22, gender: 'Female', contact: '0502223344', address: 'Ofankor', bloodType: 'O-', allergies: 'None', createdAt: new Date().toISOString(), history: [] },
   { id: 'pat-5', name: 'Yaw Sarpong', age: 55, gender: 'Male', contact: '0503334455', address: 'Medie', bloodType: 'AB+', allergies: 'Pollen', createdAt: new Date().toISOString(), history: [] },
   { id: 'pat-6', name: 'Esi Mansa', age: 41, gender: 'Female', contact: '0504445566', address: 'Nsawam', bloodType: 'A+', allergies: 'None', createdAt: new Date().toISOString(), history: [] },
   { id: 'pat-7', name: 'Kojo Antwi', age: 60, gender: 'Male', contact: '0505556677', address: 'Amasaman', bloodType: 'O+', allergies: 'Sulfa drugs', createdAt: new Date().toISOString(), history: [] },
   { id: 'pat-8', name: 'Akosua Busia', age: 19, gender: 'Female', contact: '0506667788', address: 'Pokuase', bloodType: 'B-', allergies: 'None', createdAt: new Date().toISOString(), history: [] },
   { id: 'pat-9', name: 'Nii Laryea', age: 30, gender: 'Male', contact: '0507778899', address: 'Ga North', bloodType: 'A+', allergies: 'Dust mites', createdAt: new Date().toISOString(), history: [] },
   { id: 'pat-10', name: 'Naa Ashorkor', age: 27, gender: 'Female', contact: '0508889900', address: 'Tantra Hill', bloodType: 'AB-', allergies: 'Latex', createdAt: new Date().toISOString(), history: [] }
];

const INITIAL_PATIENTS: Patient[] = [...MANUAL_PATIENTS, ...generateMockPatients(245)];

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
    // New 20 items
    { id: 'inv-011', patientId: 'pat-1', patientName: 'Kwame Mensah', date: '2023-10-11', amount: 240.00, status: 'Pending', items: ['Malaria Treatment', 'Injection'] },
    { id: 'inv-012', patientId: 'pat-2', patientName: 'Ama Serwaa', date: '2023-10-12', amount: 1500.00, status: 'Pending', items: ['CT Scan Head'] },
    { id: 'inv-013', patientId: 'pat-3', patientName: 'Kofi Kingston', date: '2023-10-12', amount: 450.00, status: 'Pending', items: ['Admission Deposit'] },
    { id: 'inv-014', patientId: 'pat-4', patientName: 'Abena Korkor', date: '2023-10-13', amount: 120.00, status: 'Pending', items: ['Physiotherapy Session'] },
    { id: 'inv-015', patientId: 'pat-5', patientName: 'Yaw Sarpong', date: '2023-10-13', amount: 600.00, status: 'Pending', items: ['Echocardiogram'] },
    { id: 'inv-016', patientId: 'pat-6', patientName: 'Esi Mansa', date: '2023-10-14', amount: 85.00, status: 'Pending', items: ['Wound Dressing'] },
    { id: 'inv-017', patientId: 'pat-7', patientName: 'Kojo Antwi', date: '2023-10-14', amount: 1250.00, status: 'Overdue', items: ['Emergency Surgery'] },
    { id: 'inv-018', patientId: 'pat-8', patientName: 'Akosua Busia', date: '2023-10-15', amount: 300.00, status: 'Pending', items: ['Antenatal Labs'] },
    { id: 'inv-019', patientId: 'pat-9', patientName: 'Nii Laryea', date: '2023-10-15', amount: 180.00, status: 'Pending', items: ['Eye Examination'] },
    { id: 'inv-020', patientId: 'pat-10', patientName: 'Naa Ashorkor', date: '2023-10-16', amount: 95.00, status: 'Pending', items: ['General Consultation'] },
    { id: 'inv-021', patientId: 'pat-1', patientName: 'Kwame Mensah', date: '2023-10-17', amount: 55.00, status: 'Pending', items: ['Pharmacy - Painkillers'] },
    { id: 'inv-022', patientId: 'pat-3', patientName: 'Kofi Kingston', date: '2023-10-17', amount: 2100.00, status: 'Overdue', items: ['Ward Stay (3 Days)'] },
    { id: 'inv-023', patientId: 'pat-2', patientName: 'Ama Serwaa', date: '2023-10-18', amount: 400.00, status: 'Pending', items: ['Specialist Review'] },
    { id: 'inv-024', patientId: 'pat-5', patientName: 'Yaw Sarpong', date: '2023-10-18', amount: 150.00, status: 'Pending', items: ['ECG Test'] },
    { id: 'inv-025', patientId: 'pat-4', patientName: 'Abena Korkor', date: '2023-10-19', amount: 320.00, status: 'Pending', items: ['X-Ray Chest'] },
    { id: 'inv-026', patientId: 'pat-6', patientName: 'Esi Mansa', date: '2023-10-19', amount: 75.00, status: 'Pending', items: ['Follow-up Visit'] },
    { id: 'inv-027', patientId: 'pat-8', patientName: 'Akosua Busia', date: '2023-10-20', amount: 1100.00, status: 'Pending', items: ['Delivery Kit'] },
    { id: 'inv-028', patientId: 'pat-7', patientName: 'Kojo Antwi', date: '2023-10-20', amount: 90.00, status: 'Pending', items: ['Dental Cleaning'] },
    { id: 'inv-029', patientId: 'pat-9', patientName: 'Nii Laryea', date: '2023-10-21', amount: 145.00, status: 'Pending', items: ['Typhoid Test'] },
    { id: 'inv-030', patientId: 'pat-10', patientName: 'Naa Ashorkor', date: '2023-10-21', amount: 650.00, status: 'Pending', items: ['Physiotherapy (Package)'] },
];

const INITIAL_LABS: LabTest[] = [
    { id: 'lab-001', patientId: 'pat-1', patientName: 'Kwame Mensah', patientAge: 45, patientGender: 'Male', patientContact: '0244123456', testName: 'Full Blood Count', date: '2023-10-11', status: 'Completed', requestedBy: 'Dr. John Smith', result: 'Normal' },
    { id: 'lab-002', patientId: 'pat-2', patientName: 'Ama Serwaa', patientAge: 28, patientGender: 'Female', patientContact: '0500987654', testName: 'Malaria Parasite', date: '2023-10-12', status: 'Pending', requestedBy: 'Dr. Jane Doe' },
    { id: 'lab-003', patientId: 'pat-3', patientName: 'Kofi Kingston', patientAge: 34, patientGender: 'Male', patientContact: '0501112233', testName: 'Widal Test', date: '2023-10-12', status: 'Completed', requestedBy: 'Dr. John Smith', result: 'Negative' },
    { id: 'lab-004', patientId: 'pat-4', patientName: 'Abena Korkor', patientAge: 22, patientGender: 'Female', patientContact: '0502223344', testName: 'Lipid Profile', date: '2023-10-13', status: 'In Progress', requestedBy: 'Dr. John Smith' },
    { id: 'lab-005', patientId: 'pat-5', patientName: 'Yaw Sarpong', patientAge: 55, patientGender: 'Male', patientContact: '0503334455', testName: 'Liver Function Test', date: '2023-10-13', status: 'Completed', requestedBy: 'Dr. Jane Doe', result: 'Elevated Enzymes' },
    { id: 'lab-006', patientId: 'pat-6', patientName: 'Esi Mansa', patientAge: 41, patientGender: 'Female', patientContact: '0504445566', testName: 'Urinalysis', date: '2023-10-14', status: 'Completed', requestedBy: 'Dr. John Smith', result: 'Trace Protein' },
    { id: 'lab-007', patientId: 'pat-7', patientName: 'Kojo Antwi', patientAge: 60, patientGender: 'Male', patientContact: '0505556677', testName: 'Blood Sugar (Fasting)', date: '2023-10-14', status: 'Pending', requestedBy: 'Dr. John Smith' },
    { id: 'lab-008', patientId: 'pat-8', patientName: 'Akosua Busia', patientAge: 19, patientGender: 'Female', patientContact: '0506667788', testName: 'Pregnancy Test', date: '2023-10-15', status: 'Completed', requestedBy: 'Dr. Jane Doe', result: 'Positive' },
    { id: 'lab-009', patientId: 'pat-9', patientName: 'Nii Laryea', patientAge: 30, patientGender: 'Male', patientContact: '0507778899', testName: 'Hepatitis B Surface Ag', date: '2023-10-15', status: 'Completed', requestedBy: 'Dr. John Smith', result: 'Negative' },
    { id: 'lab-010', patientId: 'pat-10', patientName: 'Naa Ashorkor', patientAge: 27, patientGender: 'Female', patientContact: '0508889900', testName: 'Thyroid Profile', date: '2023-10-16', status: 'In Progress', requestedBy: 'Dr. Jane Doe' },
    // New 15 items
    { id: 'lab-011', patientId: 'pat-1', patientName: 'Kwame Mensah', patientAge: 45, patientGender: 'Male', patientContact: '0244123456', testName: 'Renal Function Test', date: '2023-10-17', status: 'Pending', requestedBy: 'Dr. Kwaku Boateng' },
    { id: 'lab-012', patientId: 'pat-2', patientName: 'Ama Serwaa', patientAge: 28, patientGender: 'Female', patientContact: '0500987654', testName: 'Urine Culture', date: '2023-10-17', status: 'In Progress', requestedBy: 'Dr. Akosua Agyapong' },
    { id: 'lab-013', patientId: 'pat-3', patientName: 'Kofi Kingston', patientAge: 34, patientGender: 'Male', patientContact: '0501112233', testName: 'Stool Analysis', date: '2023-10-18', status: 'Pending', requestedBy: 'Dr. Kwame Mensah' },
    { id: 'lab-014', patientId: 'pat-4', patientName: 'Abena Korkor', patientAge: 22, patientGender: 'Female', patientContact: '0502223344', testName: 'Electrolytes (Na/K/Cl)', date: '2023-10-18', status: 'Pending', requestedBy: 'Dr. Elizabeth Ansah' },
    { id: 'lab-015', patientId: 'pat-5', patientName: 'Yaw Sarpong', patientAge: 55, patientGender: 'Male', patientContact: '0503334455', testName: 'PSA (Prostate)', date: '2023-10-19', status: 'Pending', requestedBy: 'Dr. Kofi Asante' },
    { id: 'lab-016', patientId: 'pat-6', patientName: 'Esi Mansa', patientAge: 41, patientGender: 'Female', patientContact: '0504445566', testName: 'Blood Group & Rh', date: '2023-10-19', status: 'In Progress', requestedBy: 'Dr. Abena Osei' },
    { id: 'lab-017', patientId: 'pat-7', patientName: 'Kojo Antwi', patientAge: 60, patientGender: 'Male', patientContact: '0505556677', testName: 'H. Pylori Test', date: '2023-10-20', status: 'Pending', requestedBy: 'Dr. Yaw Boakye' },
    { id: 'lab-018', patientId: 'pat-8', patientName: 'Akosua Busia', patientAge: 19, patientGender: 'Female', patientContact: '0506667788', testName: 'HIV Screening', date: '2023-10-20', status: 'Pending', requestedBy: 'Dr. Akua Mensah' },
    { id: 'lab-019', patientId: 'pat-9', patientName: 'Nii Laryea', patientAge: 30, patientGender: 'Male', patientContact: '0507778899', testName: 'Sickling Test', date: '2023-10-21', status: 'Pending', requestedBy: 'Dr. Kwabena Appiah' },
    { id: 'lab-020', patientId: 'pat-10', patientName: 'Naa Ashorkor', patientAge: 27, patientGender: 'Female', patientContact: '0508889900', testName: 'Mantoux Test', date: '2023-10-21', status: 'In Progress', requestedBy: 'Dr. Ama Owusu' },
    { id: 'lab-021', patientId: 'pat-1', patientName: 'Kwame Mensah', patientAge: 45, patientGender: 'Male', patientContact: '0244123456', testName: 'ESR', date: '2023-10-22', status: 'Pending', requestedBy: 'Dr. Kwaku Acheampong' },
    { id: 'lab-022', patientId: 'pat-2', patientName: 'Ama Serwaa', patientAge: 28, patientGender: 'Female', patientContact: '0500987654', testName: 'CRP (C-Reactive Protein)', date: '2023-10-22', status: 'Pending', requestedBy: 'Dr. Adwoa Addo' },
    { id: 'lab-023', patientId: 'pat-3', patientName: 'Kofi Kingston', patientAge: 34, patientGender: 'Male', patientContact: '0501112233', testName: 'Sputum AFB', date: '2023-10-23', status: 'In Progress', requestedBy: 'Dr. Samuel Obeng' },
    { id: 'lab-024', patientId: 'pat-5', patientName: 'Yaw Sarpong', patientAge: 55, patientGender: 'Male', patientContact: '0503334455', testName: 'Glycated Hemoglobin', date: '2023-10-23', status: 'Pending', requestedBy: 'Dr. Esther Yeboah' },
    { id: 'lab-025', patientId: 'pat-7', patientName: 'Kojo Antwi', patientAge: 60, patientGender: 'Male', patientContact: '0505556677', testName: 'Serum Uric Acid', date: '2023-10-24', status: 'Pending', requestedBy: 'Dr. Isaac Danso' },
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
    // New Inventory Items
    { id: 'inv-011', name: 'Ciprofloxacin 500mg', category: 'Medication', quantity: 1000, unit: 'Tablets', expiryDate: '2025-06-30', status: 'In Stock' },
    { id: 'inv-012', name: 'Metronidazole 400mg', category: 'Medication', quantity: 800, unit: 'Tablets', expiryDate: '2024-12-31', status: 'In Stock' },
    { id: 'inv-013', name: 'Amoxicillin + Clavulanic Acid', category: 'Medication', quantity: 600, unit: 'Tablets', expiryDate: '2025-03-15', status: 'In Stock' },
    { id: 'inv-014', name: 'Artemether + Lumefantrine', category: 'Medication', quantity: 2000, unit: 'Tablets', expiryDate: '2026-01-20', status: 'In Stock' },
    { id: 'inv-015', name: 'ORS Sachets', category: 'Consumable', quantity: 5000, unit: 'Sachets', expiryDate: '2027-01-01', status: 'In Stock' },
    { id: 'inv-016', name: 'Normal Saline 500ml', category: 'Consumable', quantity: 40, unit: 'Bottles', expiryDate: '2025-08-10', status: 'Low Stock' },
    { id: 'inv-017', name: 'Ringers Lactate 500ml', category: 'Consumable', quantity: 200, unit: 'Bottles', expiryDate: '2025-09-12', status: 'In Stock' },
    { id: 'inv-018', name: 'Dextrose 5% 500ml', category: 'Consumable', quantity: 150, unit: 'Bottles', expiryDate: '2025-07-22', status: 'In Stock' },
    { id: 'inv-019', name: 'IV Cannula G20 (Pink)', category: 'Consumable', quantity: 50, unit: 'Pieces', status: 'Low Stock' },
    { id: 'inv-020', name: 'IV Cannula G22 (Blue)', category: 'Consumable', quantity: 300, unit: 'Pieces', status: 'In Stock' },
    { id: 'inv-021', name: 'Surgical Gauze (Sterile)', category: 'Consumable', quantity: 100, unit: 'Packs', status: 'In Stock' },
    { id: 'inv-022', name: 'Adhesive Plaster', category: 'Consumable', quantity: 25, unit: 'Rolls', status: 'Low Stock' },
    { id: 'inv-023', name: 'Disposable Gloves (Large)', category: 'Consumable', quantity: 0, unit: 'Boxes', status: 'Out of Stock' },
    { id: 'inv-024', name: 'Omeprazole 20mg', category: 'Medication', quantity: 1200, unit: 'Capsules', expiryDate: '2025-05-01', status: 'In Stock' },
    { id: 'inv-025', name: 'Cetirizine 10mg', category: 'Medication', quantity: 2500, unit: 'Tablets', expiryDate: '2026-02-28', status: 'In Stock' },
    { id: 'inv-026', name: 'Losartan 50mg', category: 'Medication', quantity: 1500, unit: 'Tablets', expiryDate: '2025-11-15', status: 'In Stock' },
    { id: 'inv-027', name: 'Amlodipine 10mg', category: 'Medication', quantity: 1800, unit: 'Tablets', expiryDate: '2025-10-10', status: 'In Stock' },
    { id: 'inv-028', name: 'Atorvastatin 20mg', category: 'Medication', quantity: 1000, unit: 'Tablets', expiryDate: '2025-04-05', status: 'In Stock' },
    { id: 'inv-029', name: 'Insulin (Mixtard)', category: 'Medication', quantity: 80, unit: 'Vials', expiryDate: '2024-08-01', status: 'Low Stock' },
    { id: 'inv-030', name: 'Glucometer Test Strips', category: 'Consumable', quantity: 150, unit: 'Boxes', expiryDate: '2025-06-01', status: 'In Stock' },
    { id: 'inv-031', name: 'BP Monitor (Digital)', category: 'Equipment', quantity: 15, unit: 'Units', status: 'In Stock' },
    { id: 'inv-032', name: 'Wheelchair', category: 'Equipment', quantity: 4, unit: 'Units', status: 'Low Stock' },
    { id: 'inv-033', name: 'Nebulizer Machine', category: 'Equipment', quantity: 3, unit: 'Units', status: 'In Stock' },
    { id: 'inv-034', name: 'Oxygen Cylinder (Large)', category: 'Equipment', quantity: 8, unit: 'Cylinders', status: 'In Stock' },
    { id: 'inv-035', name: 'Pulse Oximeter', category: 'Equipment', quantity: 12, unit: 'Units', status: 'In Stock' },
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
    // Generate ID: First letter of First Name + First letter of Surname + 4 unique numbers (e.g., AR3454)
    const generateId = () => {
        const cleanName = patient.name.trim();
        if (!cleanName) return `P${Math.floor(10000 + Math.random() * 90000)}`;

        const nameParts = cleanName.split(/\s+/);
        let initials = '';
        
        if (nameParts.length >= 2) {
            // First char of first name + First char of last name
            initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        } else {
            // If only one name, use first 2 letters, or append X
            const name = nameParts[0].toUpperCase();
            initials = name.length > 1 ? name.substring(0, 2) : name + 'X';
        }

        // Clean non-alpha chars if any, though input is usually clean
        initials = initials.replace(/[^A-Z]/g, 'X');
        if (initials.length < 2) initials = initials.padEnd(2, 'X');

        const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000-9999
        return `${initials}${randomNum}`;
    };

    let newId = generateId();
    // Simple collision check retry loop
    let attempts = 0;
    while (patients.some(p => p.id === newId) && attempts < 10) {
        newId = generateId();
        attempts++;
    }

    const newPatient: Patient = {
      ...patient,
      id: newId,
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