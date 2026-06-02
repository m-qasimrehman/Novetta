import { type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { authStore } from './features/auth/store/authStore'
import { ROUTES } from './constants/routes'
import { SplashPage } from './features/auth/pages/SplashPage'
import { WelcomePage } from './features/auth/pages/WelcomePage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { VerifyOTPPage } from './features/auth/pages/VerifyOTPPage'
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage'
import { DashboardPage } from './features/auth/pages/DashboardPage'
import { GuestDashboardPage } from './features/auth/pages/GuestDashboardPage'
import { NotFoundPage } from './features/auth/pages/NotFoundPage'
import { DoctorDiscoveryPage } from './features/doctors/pages/DoctorDiscoveryPage'
import { DoctorProfilePage } from './features/doctors/pages/DoctorProfilePage'
import { AppointmentBookingPage } from './features/appointments/pages/AppointmentBookingPage'
import { AppointmentConfirmationPage } from './features/appointments/pages/AppointmentConfirmationPage'
import { MyAppointmentsPage } from './features/appointments/pages/MyAppointmentsPage'
import { TelehealthPage } from './features/telehealth/pages/TelehealthPage'
import { PrescriptionsPage } from './features/prescriptions/pages/PrescriptionsPage'
import { PrescriptionDetailPage } from './features/prescriptions/pages/PrescriptionDetailPage'
import { PharmacyPage } from './features/pharmacy/pages/PharmacyPage'
import { ProfilePage } from './features/profile/pages/ProfilePage'
import { LabTestsPage } from './features/labs/pages/LabTestsPage'
import { MedicalRecordsPage } from './features/medical-records/pages/MedicalRecordsPage'
import { MembershipPage } from './features/membership/pages/MembershipPage'
import { NotificationsPage } from './features/notifications/pages/NotificationsPage'
import { AdminDashboardPage } from './features/admin/pages/AdminDashboardPage'
import { PrescriptionScanPage } from './features/pharmacy/pages/PrescriptionScanPage'
import { MyOrdersPage } from './features/pharmacy/pages/MyOrdersPage'
import { OrderTrackingPage } from './features/pharmacy/pages/OrderTrackingPage'
import { TelePharmacistPage } from './features/pharmacist/pages/TelePharmacistPage'
import { DoctorPanelPage } from './features/doctor-panel/pages/DoctorPanelPage'
import { PharmacistConsolePage } from './features/pharmacist/pages/PharmacistConsolePage'
import { LabCoordinatorPage } from './features/labs/pages/LabCoordinatorPage'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status, accessToken } = authStore((state: any) => ({
    status: state.status,
    accessToken: state.accessToken,
  }))
  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }
  if (!accessToken) {
    return <Navigate to={ROUTES.login} replace />
  }
  return children
}

function GuestRoute({ children }: { children: ReactNode }) {
  const { status, accessToken } = authStore((state: any) => ({
    status: state.status,
    accessToken: state.accessToken,
  }))
  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }
  if (accessToken) {
    return <Navigate to={ROUTES.welcome} replace />
  }
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path={ROUTES.splash}         element={<SplashPage />} />
      <Route path={ROUTES.welcome}        element={<WelcomePage />} />
      <Route path={ROUTES.login}          element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path={ROUTES.register}       element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path={ROUTES.verifyOtp}      element={<GuestRoute><VerifyOTPPage /></GuestRoute>} />
      <Route path={ROUTES.forgotPassword} element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path={ROUTES.resetPassword}  element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

      {/* Dashboard */}
      <Route path={ROUTES.dashboard} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path={ROUTES.guest}     element={<GuestRoute><GuestDashboardPage /></GuestRoute>} />

      {/* Doctors */}
      <Route path={ROUTES.doctors} element={<DoctorDiscoveryPage />} />
      <Route path="/doctors/:id"   element={<DoctorProfilePage />} />

      {/* Booking */}
      <Route path="/book/:doctorId"             element={<ProtectedRoute><AppointmentBookingPage /></ProtectedRoute>} />
      <Route path="/appointments/:id/confirmed" element={<ProtectedRoute><AppointmentConfirmationPage /></ProtectedRoute>} />
      <Route path={ROUTES.appointments}         element={<ProtectedRoute><MyAppointmentsPage /></ProtectedRoute>} />

      {/* Telehealth */}
      <Route path="/telehealth/:id" element={<ProtectedRoute><TelehealthPage /></ProtectedRoute>} />

      {/* Prescriptions */}
      <Route path={ROUTES.prescriptions} element={<ProtectedRoute><PrescriptionsPage /></ProtectedRoute>} />
      <Route path="/prescriptions/:id"   element={<ProtectedRoute><PrescriptionDetailPage /></ProtectedRoute>} />

      {/* Pharmacy */}
      <Route path={ROUTES.pharmacy}      element={<PharmacyPage />} />
      <Route path={ROUTES.pharmacyScan}  element={<ProtectedRoute><PrescriptionScanPage /></ProtectedRoute>} />
      <Route path={ROUTES.pharmacyOrders} element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
      <Route path="/pharmacy/orders/:id/track" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />

      {/* Tele-Pharmacist */}
      <Route path={ROUTES.telePharmacist} element={<TelePharmacistPage />} />

      {/* Profile */}
      <Route path={ROUTES.profile} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Labs */}
      <Route path={ROUTES.labs} element={<LabTestsPage />} />

      {/* Medical Records */}
      <Route path={ROUTES.medicalRecords} element={<ProtectedRoute><MedicalRecordsPage /></ProtectedRoute>} />

      {/* Membership */}
      <Route path={ROUTES.membership} element={<ProtectedRoute><MembershipPage /></ProtectedRoute>} />

      {/* Notifications */}
      <Route path={ROUTES.notifications} element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

      {/* Doctor Panel */}
      <Route path={ROUTES.doctorPanel} element={<ProtectedRoute><DoctorPanelPage /></ProtectedRoute>} />

      {/* Pharmacist Console */}
      <Route path={ROUTES.pharmacistConsole} element={<ProtectedRoute><PharmacistConsolePage /></ProtectedRoute>} />

      {/* Lab Coordinator */}
      <Route path={ROUTES.labCoordinator} element={<ProtectedRoute><LabCoordinatorPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path={ROUTES.admin} element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />

      <Route path={ROUTES.notFound} element={<NotFoundPage />} />
    </Routes>
  )
}
