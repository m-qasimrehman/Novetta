export const ROUTES = {
  splash: '/',
  welcome: '/welcome',
  login: '/auth/login',
  register: '/auth/register',
  verifyOtp: '/auth/verify-otp',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  dashboard: '/dashboard',
  guest: '/guest',
  // Doctors
  doctors: '/doctors',
  doctorProfile: (id: string) => `/doctors/${id}`,
  bookAppointment: (doctorId: string) => `/book/${doctorId}`,
  // Appointments
  appointments: '/appointments',
  appointmentConfirmation: (id: string) => `/appointments/${id}/confirmed`,
  // Telehealth
  telehealth: (id: string) => `/telehealth/${id}`,
  // Prescriptions
  prescriptions: '/prescriptions',
  prescriptionDetail: (id: string) => `/prescriptions/${id}`,
  // Pharmacy
  pharmacy: '/pharmacy',
  pharmacyScan: '/pharmacy/scan',
  pharmacyOrders: '/pharmacy/orders',
  pharmacyOrderTracking: (id: string) => `/pharmacy/orders/${id}/track`,
  // Tele-Pharmacist
  telePharmacist: '/pharmacist',
  // Profile
  profile: '/profile',
  // Labs
  labs: '/labs',
  myLabBookings: '/labs/my-bookings',
  // Medical Records
  medicalRecords: '/medical-records',
  // Membership
  membership: '/membership',
  // Notifications
  notifications: '/notifications',
  // Admin
  admin: '/admin',
  // Doctor Panel
  doctorPanel: '/doctor-panel',
  // Pharmacist Console
  pharmacistConsole: '/pharmacist-console',
  // Lab Coordinator
  labCoordinator: '/lab-coordinator',
  notFound: '*',
} as const
