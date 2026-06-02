import { apiClient } from './axios'

// ── Doctors ──────────────────────────────────────────────────────────────────
export interface Doctor {
  id: string
  userId: string
  specialization: string | null
  qualification: string | null
  experience: number
  rating: number
  totalReviews: number
  isOnline: boolean
  isVerified: boolean
  about: string | null
  consultationFee: number | null
  city: string | null
  location: string | null
  languages: string[]
  consultationTypes: string[]
  imageUrl: string | null
  createdAt: string
  user: { id: string; name: string; email: string }
  availabilitySlots?: AvailabilitySlot[]
  reviews?: DoctorReview[]
  _count?: { appointments: number }
}

export interface AvailabilitySlot {
  id: string
  doctorId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDurationMin: number
  isActive: boolean
}

export interface DoctorReview {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  patient: { id: string; name: string }
}

export interface TimeSlot {
  slotId: string
  time: string
  available: boolean
}

export const doctorsApi = {
  search: (params: Record<string, string | number | undefined>) =>
    apiClient.get('/doctors', { params }),
  getOne: (id: string) => apiClient.get<{ id: string } & Doctor>(`/doctors/${id}`),
  getAvailability: (id: string, date: string) =>
    apiClient.get<{ date: string; slots: TimeSlot[] }>(`/doctors/${id}/availability`, { params: { date } }),
  getSpecializations: () => apiClient.get<string[]>('/doctors/specializations'),
  getCities: () => apiClient.get<string[]>('/doctors/cities'),
  addReview: (id: string, data: { rating: number; comment?: string }) =>
    apiClient.post(`/doctors/${id}/reviews`, data),
}

// ── Appointments ─────────────────────────────────────────────────────────────
export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  appointmentDate: string | null
  status: string
  consultationType: string | null
  reason: string | null
  notes: string | null
  paymentStatus: string
  paymentAmount: number | null
  confirmationCode: string | null
  createdAt: string
  doctor: Doctor & { user: { id: string; name: string; email: string } }
  patient?: { id: string; name: string; email: string }
  telehealthSessions?: { id: string; roomCode: string | null; meetingUrl: string | null; status: string }[]
}

export const appointmentsApi = {
  book: (data: {
    doctorId: string
    slotId?: string
    appointmentDate: string
    consultationType: string
    reason?: string
    notes?: string
  }) => apiClient.post<{ success: boolean; data: Appointment }>('/appointments', data),
  list: (status?: string) =>
    apiClient.get<{ success: boolean; data: Appointment[] }>('/appointments', { params: status ? { status } : {} }),
  getOne: (id: string) => apiClient.get<{ success: boolean; data: Appointment }>(`/appointments/${id}`),
  cancel: (id: string) => apiClient.patch(`/appointments/${id}/cancel`),
  confirmPayment: (id: string) => apiClient.patch(`/appointments/${id}/confirm-payment`),
  reschedule: (id: string, appointmentDate: string) =>
    apiClient.patch(`/appointments/${id}/reschedule`, { appointmentDate }),
}

// ── Telehealth ────────────────────────────────────────────────────────────────
export interface TelehealthSession {
  id: string
  appointmentId: string | null
  doctorId: string
  patientId: string
  meetingUrl: string | null
  roomCode: string | null
  status: string
  startedAt: string | null
  endedAt: string | null
  createdAt: string
  doctor: Doctor & { user: { id: string; name: string } }
  patient: { id: string; name: string; email: string }
  appointment?: Appointment
  consultationNotes?: { id: string; diagnosis: string | null; notes: string | null }[]
  prescriptions?: Prescription[]
}

export const telehealthApi = {
  list: () => apiClient.get<{ success: boolean; data: TelehealthSession[] }>('/telehealth'),
  getOne: (id: string) => apiClient.get<{ success: boolean; data: TelehealthSession }>(`/telehealth/${id}`),
  start: (appointmentId: string) => apiClient.post(`/telehealth/start/${appointmentId}`),
  end: (id: string) => apiClient.patch(`/telehealth/${id}/end`),
}

// ── Prescriptions ─────────────────────────────────────────────────────────────
export interface Prescription {
  id: string
  sessionId: string
  doctorId: string
  patientId: string
  notes: string | null
  createdAt: string
  doctor: Doctor & { user: { id: string; name: string } }
  patient?: { id: string; name: string; email: string; phone: string | null }
  items: PrescriptionItem[]
  session?: { id: string; createdAt: string }
}

export interface PrescriptionItem {
  id: string
  medicineName: string | null
  dosage: string | null
  frequency: string | null
  duration: string | null
  instructions: string | null
}

export const prescriptionsApi = {
  list: () => apiClient.get<{ success: boolean; data: Prescription[] }>('/prescriptions'),
  getOne: (id: string) => apiClient.get<{ success: boolean; data: Prescription }>(`/prescriptions/${id}`),
}

// ── Medical Records ───────────────────────────────────────────────────────────
export interface MedicalRecord {
  id: string
  patientId: string
  title: string | null
  description: string | null
  fileUrl: string | null
  recordType: string | null
  createdAt: string
}

export const medicalRecordsApi = {
  list: () => apiClient.get<{ success: boolean; data: MedicalRecord[] }>('/medical-records'),
  create: (data: { title: string; description?: string; recordType?: string; fileUrl?: string }) =>
    apiClient.post<{ success: boolean; data: MedicalRecord }>('/medical-records', data),
  delete: (id: string) => apiClient.delete(`/medical-records/${id}`),
}

// ── Pharmacy ──────────────────────────────────────────────────────────────────
export interface Medicine {
  id: string
  name: string
  genericName: string | null
  manufacturer: string | null
  category: string | null
  price: number
  unit: string | null
  barcode: string | null
  imageUrl: string | null
  description: string | null
  inStock: boolean
}

export interface PharmacyOrder {
  id: string
  patientId: string
  prescriptionId: string | null
  status: string
  deliveryType: string
  address: string | null
  totalAmount: number
  notes: string | null
  createdAt: string
  items: { id: string; quantity: number; price: number; medicine: Pick<Medicine, 'id' | 'name' | 'imageUrl'> }[]
}

export interface PharmacyComparison {
  id: string
  name: string
  distance: string
  rating: number
  deliveryTime: string
  price: number
  inStock: boolean
  memberDiscount: number
  memberPrice: number
}

export interface OcrResult {
  id: string
  name: string
  genericName: string | null
  confidence: number
  dosage: string
  frequency: string
  duration: string
  price: number
  inStock: boolean
}

export interface TrackingStep {
  id: string
  label: string
  icon: string
  completedAt: string | null
  done: boolean
}

export const pharmacyApi = {
  searchMedicines: (params: { q?: string; category?: string; page?: number }) =>
    apiClient.get<{ success: boolean; data: Medicine[]; pagination: any }>('/pharmacy/medicines', { params }),
  getCategories: () => apiClient.get<string[]>('/pharmacy/medicines/categories'),
  getMedicine: (id: string) => apiClient.get<{ success: boolean; data: Medicine }>(`/pharmacy/medicines/${id}`),
  lookupBarcode: (code: string) =>
    apiClient.get<{ success: boolean; data: { medicine: Medicine; comparison: PharmacyComparison[] } }>(`/pharmacy/barcode/${code}`),
  comparePrices: (medicineId: string) =>
    apiClient.get<{ success: boolean; data: { medicine: Medicine; pharmacies: PharmacyComparison[] } }>(`/pharmacy/compare/${medicineId}`),
  scanPrescription: (file: File) => {
    const formData = new FormData()
    formData.append('prescription', file)
    return apiClient.post<{ success: boolean; medicines: OcrResult[]; message: string }>('/pharmacy/ocr-scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  pharmacistConsult: (symptoms: string[]) =>
    apiClient.post<{ success: boolean; data: { symptoms: string[]; advice: string; disclaimer: string; recommendations: Medicine[] } }>('/pharmacy/pharmacist-consult', { symptoms }),
  createOrder: (data: {
    items: { medicineId: string; quantity: number }[]
    deliveryType: string
    address?: string
    prescriptionId?: string
    notes?: string
    couponCode?: string
  }) => apiClient.post<{ success: boolean; data: PharmacyOrder }>('/pharmacy/orders', data),
  listOrders: () => apiClient.get<{ success: boolean; data: PharmacyOrder[] }>('/pharmacy/orders'),
  getOrder: (id: string) => apiClient.get<{ success: boolean; data: PharmacyOrder }>(`/pharmacy/orders/${id}`),
  getOrderTracking: (id: string) =>
    apiClient.get<{ success: boolean; data: { order: PharmacyOrder; tracking: { steps: TrackingStep[]; currentStep: number; estimatedDelivery: string; rider: { name: string; phone: string; rating: number } | null } } }>(`/pharmacy/orders/${id}/tracking`),
  cancelOrder: (id: string) => apiClient.patch(`/pharmacy/orders/${id}/cancel`),
  generateDeliveryOtp: (id: string) => apiClient.post(`/pharmacy/orders/${id}/delivery-otp`),
  confirmDelivery: (id: string, otp: string) => apiClient.patch(`/pharmacy/orders/${id}/confirm-delivery`, { otp }),
  // Pharmacies
  listPharmacies: (city?: string) =>
    apiClient.get<{ success: boolean; data: PharmacyLocation[] }>('/pharmacy/pharmacies', { params: { city } }),
  getPharmacyInventory: (pharmacyId: string, q?: string) =>
    apiClient.get<{ success: boolean; data: PharmacyInventoryItem[] }>(`/pharmacy/pharmacies/${pharmacyId}/inventory`, { params: { q } }),
  // Patient tele-pharmacist sessions
  createConsultSession: (symptoms: string[], pharmacyId?: string) =>
    apiClient.post<{ success: boolean; data: PharmacistSession }>('/pharmacy/consult-sessions', { symptoms, pharmacyId }),
  getMyConsultSessions: () =>
    apiClient.get<{ success: boolean; data: PharmacistSession[] }>('/pharmacy/consult-sessions/my'),
  cancelConsultSession: (sessionId: string) =>
    apiClient.patch(`/pharmacy/consult-sessions/${sessionId}/cancel`),
  getPatientChatMessages: (pharmacistId: string) =>
    apiClient.get<{ success: boolean; data: any[] }>(`/pharmacy/chat/${pharmacistId}`),
  sendPatientMessage: (receiverId: string, message: string) =>
    apiClient.post<{ success: boolean; data: any }>('/pharmacy/chat', { receiverId, message }),
}

export interface PharmacyLocation {
  id: string
  name: string
  address: string
  city: string | null
  latitude: number | null
  longitude: number | null
  deliveryRadius: number | null
  phone: string | null
  isActive: boolean
  offersDelivery: boolean
  offersPickup: boolean
}

export interface PharmacyInventoryItem {
  id: string
  pharmacyId: string
  medicineId: string
  price: number
  stock: number
  lowThreshold: number
  isAvailable: boolean
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock'
  medicine: {
    id: string
    name: string
    genericName: string | null
    category: string | null
    imageUrl: string | null
    prescriptionRequired: boolean
    description: string | null
  }
}

export interface PharmacistSession {
  id: string
  pharmacyId: string | null
  pharmacistId: string | null
  patientId: string
  symptoms: string[]
  status: 'waiting' | 'active' | 'completed' | 'cancelled'
  sessionNotes: string | null
  signatureHash: string | null
  signedAt: string | null
  completedAt: string | null
  createdAt: string
  patient?: { id: string; name: string; email: string; phone: string | null }
}

export const pharmacistPanelApi = {
  getMe: () => apiClient.get<{ success: boolean; data: PharmacyLocation | null; pharmacist: any }>('/pharmacist-panel/me'),
  // Queue
  getQueue: () => apiClient.get<{ success: boolean; data: PharmacistSession[] }>('/pharmacist-panel/queue'),
  getActiveSessions: () => apiClient.get<{ success: boolean; data: PharmacistSession[] }>('/pharmacist-panel/active-sessions'),
  acceptSession: (sessionId: string) => apiClient.patch(`/pharmacist-panel/sessions/${sessionId}/accept`),
  completeSession: (sessionId: string, notes?: string) =>
    apiClient.patch(`/pharmacist-panel/sessions/${sessionId}/complete`, { notes }),
  // Prescription with digital signature
  issuePrescription: (sessionId: string, data: {
    patientId: string
    notes?: string
    sessionNotes?: string
    items: { medicineName: string; dosage?: string; frequency?: string; duration?: string; instructions?: string }[]
  }) => apiClient.post<{ success: boolean; data: { prescription: any; signature: any } }>(`/pharmacist-panel/sessions/${sessionId}/prescribe`, data),
  // Chat
  getMessages: (patientId: string) => apiClient.get<{ success: boolean; data: any[] }>(`/pharmacist-panel/chat/${patientId}`),
  sendMessage: (receiverId: string, message: string) =>
    apiClient.post<{ success: boolean; data: any }>('/pharmacist-panel/chat', { receiverId, message }),
  // Patient summary
  getPatientSummary: (patientId: string) =>
    apiClient.get<{ success: boolean; data: any }>(`/pharmacist-panel/patients/${patientId}/summary`),
  // Inventory
  getInventory: (pharmacyId: string) =>
    apiClient.get<{ success: boolean; data: any[] }>(`/pharmacist-panel/inventory/${pharmacyId}`),
  upsertInventory: (pharmacyId: string, data: { medicineId: string; stock: number; price: number; lowThreshold?: number }) =>
    apiClient.post(`/pharmacist-panel/inventory/${pharmacyId}`, data),
  // Orders
  getOrders: (params?: { pharmacyId?: string; status?: string; page?: number }) =>
    apiClient.get<{ success: boolean; data: any[]; total: number; pages: number }>('/pharmacist-panel/orders', { params }),
  updateOrderStatus: (id: string, status: string) =>
    apiClient.patch(`/pharmacist-panel/orders/${id}/status`, { status }),
  validatePrescription: (id: string, approved: boolean, note?: string) =>
    apiClient.patch(`/pharmacist-panel/orders/${id}/validate-prescription`, { approved, note }),
}

// ── Profile ───────────────────────────────────────────────────────────────────
export interface Dependent {
  id: string
  name: string
  relationship: string
  dateOfBirth: string | null
  gender: string | null
  bloodGroup: string | null
}

export interface MedicalHistory {
  id: string
  condition: string
  diagnosedAt: string | null
  notes: string | null
  isCurrent: boolean
  createdAt: string
}

export interface SavedAddress {
  id: string
  label: string
  address: string
  city: string | null
  isDefault: boolean
  createdAt: string
}

export const profileApi = {
  get: () => apiClient.get('/profile'),
  update: (data: { name?: string; phone?: string }) => apiClient.patch('/profile', data),
  listHistory: () => apiClient.get<{ success: boolean; data: MedicalHistory[] }>('/profile/medical-history'),
  addHistory: (data: { condition: string; diagnosedAt?: string; notes?: string }) =>
    apiClient.post('/profile/medical-history', data),
  deleteHistory: (id: string) => apiClient.delete(`/profile/medical-history/${id}`),
  listDependents: () => apiClient.get<{ success: boolean; data: Dependent[] }>('/profile/dependents'),
  addDependent: (data: { name: string; relationship: string; dateOfBirth?: string; gender?: string; bloodGroup?: string }) =>
    apiClient.post('/profile/dependents', data),
  deleteDependent: (id: string) => apiClient.delete(`/profile/dependents/${id}`),
  listAddresses: () => apiClient.get<{ success: boolean; data: SavedAddress[] }>('/profile/addresses'),
  addAddress: (data: { label: string; address: string; city?: string; isDefault?: boolean }) =>
    apiClient.post('/profile/addresses', data),
  setDefaultAddress: (id: string) => apiClient.patch(`/profile/addresses/${id}/default`),
  deleteAddress: (id: string) => apiClient.delete(`/profile/addresses/${id}`),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export interface MembershipPlan {
  id: string
  name: string
  description: string | null
  price: number
  durationDays: number
  discountPct: number
  features: string[]
  freeDelivery: boolean
  maxAnnualSavings: number | null
  isActive: boolean
  createdAt: string
  _count?: { subscriptions: number }
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  discountType: string
  discountValue: number
  minAmount: number | null
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

// ── Doctor Panel ──────────────────────────────────────────────────────────────
export interface DoctorPanelProfile {
  user: { id: string; name: string; email: string; phone: string | null }
  doctor: {
    id: string
    userId: string
    specialization: string | null
    qualification: string | null
    experience: number
    rating: number
    totalReviews: number
    isOnline: boolean
    isVerified: boolean
    about: string | null
    consultationFee: number | null
    city: string | null
    location: string | null
    languages: string[]
    consultationTypes: string[]
    imageUrl: string | null
    homeVisits: boolean
    homeVisitAreas: string[]
    certificationUrls: string[]
    availabilitySlots: AvailabilitySlot[]
  }
}

export interface DoctorPanelStats {
  total: number
  pending: number
  confirmed: number
  completed: number
  cancelled: number
  todayCount: number
  weekCount: number
  revenue: number
  rating: number
  totalReviews: number
  isOnline: boolean
  upcoming: Array<{
    id: string
    appointmentDate: string | null
    status: string
    consultationType: string | null
    reason: string | null
    patient: { id: string; name: string; email: string; phone: string | null }
  }>
  recentPayments: Array<{
    id: string
    paymentAmount: string | null
    appointmentDate: string | null
    consultationType: string | null
    patient: { name: string }
  }>
}

export interface DoctorAppointment {
  id: string
  patientId: string
  doctorId: string
  appointmentDate: string | null
  status: string
  consultationType: string | null
  reason: string | null
  notes: string | null
  paymentStatus: string
  paymentAmount: string | null
  confirmationCode: string | null
  createdAt: string
  patient: { id: string; name: string; email: string; phone: string | null }
  telehealthSessions: Array<{ id: string; status: string; meetingUrl: string | null }>
}

export interface PrescriptionItem {
  id: string
  medicineName: string | null
  dosage: string | null
  frequency: string | null
  duration: string | null
  instructions: string | null
}

export interface DoctorPrescription {
  id: string
  patientId: string
  doctorId: string
  notes: string | null
  createdAt: string
  items: PrescriptionItem[]
  patient: { id: string; name: string; email: string }
}

export const doctorPanelApi = {
  getProfile: () => apiClient.get<DoctorPanelProfile>('/doctor-panel/profile'),
  updateProfile: (data: Partial<{ name: string; specialization: string; qualification: string; experience: number; about: string; consultationFee: number; city: string; location: string; languages: string[]; consultationTypes: string[]; imageUrl: string }>) =>
    apiClient.put<DoctorPanelProfile>('/doctor-panel/profile', data),
  setOnlineStatus: (isOnline: boolean) => apiClient.patch('/doctor-panel/online-status', { isOnline }),
  updateHomeVisits: (homeVisits: boolean, homeVisitAreas?: string[]) =>
    apiClient.patch('/doctor-panel/home-visits', { homeVisits, homeVisitAreas }),
  getAvailability: () => apiClient.get<AvailabilitySlot[]>('/doctor-panel/availability'),
  updateAvailability: (slots: { dayOfWeek: number; startTime: string; endTime: string; slotDurationMin: number; isActive: boolean }[]) =>
    apiClient.put<AvailabilitySlot[]>('/doctor-panel/availability', { slots }),
  addCertification: (name: string, url: string) =>
    apiClient.post<{ certificationUrls: string[] }>('/doctor-panel/certifications', { name, url }),
  removeCertification: (index: number) =>
    apiClient.delete<{ certificationUrls: string[] }>(`/doctor-panel/certifications/${index}`),
  getStats: () => apiClient.get<DoctorPanelStats>('/doctor-panel/stats'),

  // Appointments
  getAppointments: (status?: string, page = 1) =>
    apiClient.get<{ success: boolean; data: DoctorAppointment[]; total: number; pages: number }>('/doctor-panel/appointments', { params: { status, page } }),
  updateAppointmentStatus: (id: string, status: string, newDate?: string) =>
    apiClient.patch(`/doctor-panel/appointments/${id}/status`, { status, newDate }),

  // Patient records
  getPatientRecords: (patientId: string) =>
    apiClient.get<{ success: boolean; data: any }>(`/doctor-panel/patients/${patientId}/records`),

  // Prescriptions
  issuePrescription: (data: { patientId: string; appointmentId?: string; notes?: string; items: { medicineName: string; dosage?: string; frequency?: string; duration?: string; instructions?: string }[] }) =>
    apiClient.post<{ success: boolean; data: DoctorPrescription }>('/doctor-panel/prescriptions', data),
  getDoctorPrescriptions: (page = 1) =>
    apiClient.get<{ success: boolean; data: DoctorPrescription[]; total: number; pages: number }>('/doctor-panel/prescriptions', { params: { page } }),

  // Chat
  getMessages: () => apiClient.get<{ success: boolean; data: any[] }>('/doctor-panel/messages'),
  sendMessage: (receiverId: string, message: string) =>
    apiClient.post<{ success: boolean; data: any }>('/doctor-panel/messages', { receiverId, message }),
}

export const adminApi = {
  // Stats & Overview
  getStats: (params?: { dateFrom?: string; dateTo?: string }) =>
    apiClient.get<{ success: boolean; data: any }>('/admin/stats', { params }),
  getRevenue: () => apiClient.get<{ success: boolean; data: any }>('/admin/revenue'),
  getActivity: () => apiClient.get<{ success: boolean; data: any }>('/admin/activity'),

  // Users
  listUsers: (page = 1, role?: string, q?: string) =>
    apiClient.get<{ success: boolean; data: any[]; total: number; pages: number }>('/admin/users', { params: { page, role, q } }),
  toggleUser: (id: string) => apiClient.patch(`/admin/users/${id}/toggle`),

  // Doctors
  listDoctors: () => apiClient.get<{ success: boolean; data: any[] }>('/admin/doctors'),
  verifyDoctor: (id: string) => apiClient.patch(`/admin/doctors/${id}/verify`),

  // Membership Plans
  listPlans: () => apiClient.get<{ success: boolean; data: MembershipPlan[] }>('/admin/plans'),
  createPlan: (data: Partial<MembershipPlan>) => apiClient.post<{ success: boolean; data: MembershipPlan }>('/admin/plans', data),
  updatePlan: (id: string, data: Partial<MembershipPlan>) => apiClient.patch<{ success: boolean; data: MembershipPlan }>(`/admin/plans/${id}`, data),
  deletePlan: (id: string) => apiClient.delete(`/admin/plans/${id}`),
  getMembershipStats: () => apiClient.get<{ success: boolean; data: any }>('/admin/membership-stats'),

  // Coupons
  listCoupons: () => apiClient.get<{ success: boolean; data: Coupon[] }>('/admin/coupons'),
  createCoupon: (data: { code: string; description?: string; discountType: string; discountValue: number; minAmount?: number; maxUses?: number; expiresAt?: string }) =>
    apiClient.post<{ success: boolean; data: Coupon }>('/admin/coupons', data),
  updateCoupon: (id: string, data: { isActive?: boolean; maxUses?: number }) =>
    apiClient.patch(`/admin/coupons/${id}`, data),
  deleteCoupon: (id: string) => apiClient.delete(`/admin/coupons/${id}`),

  // Appointments & Orders
  listAllAppointments: (status?: string, page = 1) =>
    apiClient.get<{ success: boolean; data: any[]; total: number; pages: number }>('/admin/appointments', { params: { status, page } }),
  listAllOrders: (type: 'pharmacy' | 'lab' = 'pharmacy', page = 1) =>
    apiClient.get<{ success: boolean; data: any[]; total: number }>('/admin/orders', { params: { type, page } }),

  // Payouts
  getPayouts: () => apiClient.get<{ success: boolean; data: any }>('/admin/payouts'),

  // Pharmacies
  listPharmacies: () => apiClient.get<{ success: boolean; data: any[] }>('/admin/pharmacies'),
  togglePharmacy: (id: string) => apiClient.patch(`/admin/pharmacies/${id}/toggle`),

  // Lab Centers
  listLabCenters: () => apiClient.get<{ success: boolean; data: any[] }>('/admin/labs'),
  toggleLab: (id: string) => apiClient.patch(`/admin/labs/${id}/toggle`),

  // System
  getOnlineUsers: () => apiClient.get<{ success: boolean; data: any }>('/admin/online-users'),
}

// ── Labs ──────────────────────────────────────────────────────────────────────
export interface LabTest {
  id: string
  labCenterId: string | null
  name: string
  description: string | null
  category: string | null
  price: string
  discountPct: number
  turnaround: string | null
  homeCollection: boolean
  requiresFasting: boolean
  sampleType: string | null
  preparation: string | null
  isActive: boolean
  createdAt: string
  labCenter?: { id: string; name: string; city: string | null } | null
}

export interface LabPackage {
  id: string
  labCenterId: string | null
  name: string
  description: string | null
  price: string
  discountPct: number
  isActive: boolean
  createdAt: string
  items: { packageId: string; testId: string; test: LabTest }[]
  labCenter?: { id: string; name: string; city: string | null } | null
}

export interface LabCenter {
  id: string
  name: string
  address: string
  city: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  email: string | null
  isActive: boolean
  openTime: string
  closeTime: string
  workingDays: string[]
  homeCollection: boolean
  collectionZones: string[]
  ownerId: string | null
  createdAt: string
}

export interface LabBooking {
  id: string
  patientId: string
  testId: string | null
  packageId: string | null
  labCenterId: string | null
  status: string
  collectionType: string
  scheduledAt: string
  address: string | null
  notes: string | null
  amount: string
  reportUrl: string | null
  reportNote: string | null
  reportUploadedAt: string | null
  patientNotified: boolean
  phlebotomistName: string | null
  phlebotomistPhone: string | null
  createdAt: string
  test?: LabTest | null
  package?: LabPackage | null
  labCenter?: { id: string; name: string; address: string; phone: string | null } | null
  patient?: { id: string; name: string; phone: string | null; email: string }
}

export const labsApi = {
  listTests: (category?: string, q?: string) =>
    apiClient.get<LabTest[]>('/labs/tests', { params: { category, q } }),
  getTest: (id: string) => apiClient.get<LabTest>(`/labs/tests/${id}`),
  listPackages: (labCenterId?: string) =>
    apiClient.get<LabPackage[]>('/labs/packages', { params: { labCenterId } }),
  listCenters: (city?: string) =>
    apiClient.get<LabCenter[]>('/labs/centers', { params: { city } }),
  book: (data: {
    testId?: string
    packageId?: string
    labCenterId?: string
    collectionType: string
    scheduledAt: string
    address?: string
    notes?: string
  }) => apiClient.post('/labs/book', data),
  myBookings: () => apiClient.get<LabBooking[]>('/labs/my-bookings'),
  cancelBooking: (id: string) => apiClient.patch(`/labs/bookings/${id}/cancel`),
}

export const labCoordinatorApi = {
  // Center
  getCenter: () => apiClient.get<{ success: boolean; data: LabCenter | null }>('/lab-coordinator/center'),
  upsertCenter: (data: Partial<LabCenter>) =>
    apiClient.patch<{ success: boolean; data: LabCenter }>('/lab-coordinator/center', data),
  // Stats
  getStats: () =>
    apiClient.get<{ success: boolean; data: { total: number; todayCount: number; pending: number; homeCollection: number; reportReady: number; processing: number } }>('/lab-coordinator/stats'),
  // Tests
  getTests: (q?: string) =>
    apiClient.get<LabTest[]>('/lab-coordinator/tests', { params: { q } }),
  createTest: (data: Omit<Partial<LabTest>, 'id' | 'createdAt' | 'labCenter'>) =>
    apiClient.post<{ success: boolean; data: LabTest }>('/lab-coordinator/tests', data),
  updateTest: (id: string, data: Partial<LabTest>) =>
    apiClient.patch<{ success: boolean; data: LabTest }>(`/lab-coordinator/tests/${id}`, data),
  deleteTest: (id: string) => apiClient.delete(`/lab-coordinator/tests/${id}`),
  // Packages
  getPackages: () => apiClient.get<LabPackage[]>('/lab-coordinator/packages'),
  createPackage: (data: { name: string; description?: string; price: number; discountPct?: number; testIds: string[] }) =>
    apiClient.post<{ success: boolean; data: LabPackage }>('/lab-coordinator/packages', data),
  updatePackage: (id: string, data: Partial<{ name: string; description: string; price: number; discountPct: number; isActive: boolean; testIds: string[] }>) =>
    apiClient.patch<{ success: boolean; data: LabPackage }>(`/lab-coordinator/packages/${id}`, data),
  deletePackage: (id: string) => apiClient.delete(`/lab-coordinator/packages/${id}`),
  // Bookings
  getBookings: (params?: { status?: string; collectionType?: string; date?: string; page?: number }) =>
    apiClient.get<{ success: boolean; data: LabBooking[]; total: number; pages: number }>('/lab-coordinator/bookings', { params }),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/lab-coordinator/bookings/${id}/status`, { status }),
  assignPhlebotomist: (id: string, name: string, phone: string) =>
    apiClient.patch(`/lab-coordinator/bookings/${id}/assign`, { name, phone }),
  uploadReport: (id: string, reportUrl: string, reportNote?: string) =>
    apiClient.patch(`/lab-coordinator/bookings/${id}/report`, { reportUrl, reportNote }),
}

export const membershipApi = {
  listPlans: () => apiClient.get<{ success: boolean; data: any[] }>('/membership/plans'),
  myMembership: () => apiClient.get<any>('/membership/my'),
  subscribe: (planId: string) => apiClient.post<any>('/membership/subscribe', { planId }),
  applyCoupon: (code: string, amount: number) =>
    apiClient.post<{ valid: boolean; discount: number; finalAmount: number; coupon: any }>('/membership/apply-coupon', { code, amount }),
}

export const chatApi = {
  getConversation: (partnerId: string) =>
    apiClient.get<{ success: boolean; data: any[] }>(`/chat/${partnerId}`),
  send: (receiverId: string, message: string) =>
    apiClient.post<{ success: boolean; data: any }>('/chat/send', { receiverId, message }),
  getLimit: (doctorUserId: string) =>
    apiClient.get<{ success: boolean; data: { count: number; hasActiveAppt: boolean; limit: number } }>(`/chat/${doctorUserId}/limit`),
}
