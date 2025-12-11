
export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  NURSE = 'NURSE',
  PHARMACIST = 'PHARMACIST',
  LAB_TECHNICIAN = 'LAB_TECHNICIAN'
}

export interface User {
  id: string;
  username: string; // Used as ID for patients
  name: string;
  role: UserRole;
  specialization?: string; // For doctors
  department?: string; // For other staff
  contact?: string;
  licensureNumber?: string; // For doctors
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  address: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  chronicConditions?: string;
  bloodType?: string;
  allergies?: string;
  assignedDoctorId?: string;
  history: MedicalRecord[];
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  doctorId: string;
  doctorName: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  items: string[];
}

export interface LabTest {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientContact?: string;
  testName: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  result?: string;
  requestedBy: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Medication' | 'Equipment' | 'Consumable';
  quantity: number;
  unit: string;
  expiryDate?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
