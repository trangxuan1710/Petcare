import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DoctorHome from './pages/doctors/Home';
import DoctorTickets from './pages/doctors/Tickets';
import DoctorTicketDetails from './pages/doctors/TicketDetails';
import ServiceOrder from './pages/doctors/ServiceOrder';
import { RecordResult } from './pages/doctors/RecordResult';
import MedicineSelector from './pages/doctors/MedicineSelector';
import ClinicalServices from './pages/doctors/ClinicalServices';
import ResultSummary from './pages/doctors/ResultSummary';
import Notifications from './pages/doctors/Notifications';
import TodayOrders from './pages/receptionists/TodayOrders';
import NewReception from './pages/receptionists/NewReception';
import ReceptionistNotifications from './pages/receptionists/Notifications';
import ReceptionistPayment from './pages/receptionists/Payment';
import TechHome from './pages/techStaffs/Home';
import TechRecordResult from './pages/techStaffs/RecordResult';
import TechMedicineSelector from './pages/techStaffs/MedicineSelector';
import TechNotifications from './pages/techStaffs/Notifications';
import {RequireAuth, RequireRole} from './routes/routeGuard';
import { RECEPTIONIST_PATHS } from './routes/receptionistPaths';
import { TECH_PATHS } from './routes/techPaths';
import NotFound from './pages/NotFound';
import { Toaster } from 'react-hot-toast';
import { useNotificationSSE } from './hooks/useNotificationSSE';

const getDefaultPathByRole = (role) => {
  if (role === 'DOCTOR') return '/doctors/home';
  if (role === 'RECEPTIONIST' || role === 'STAFF') return RECEPTIONIST_PATHS.TODAY_ORDERS;
  if (role === 'TECHNICIAN') return TECH_PATHS.HOME;
  return '/login';
};

const RootRedirect = () => {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role');

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultPathByRole(role)} replace />;
};

const NotificationSSEBridge = () => {
  useNotificationSSE();
  return null;
};

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <NotificationSSEBridge />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
      <Route path="/404" element={<NotFound />} />

      <Route element={<RequireAuth />}>
        <Route element={<RequireRole allowedRoles={['DOCTOR']} />}>
          <Route path="/doctors/home" element={<DoctorHome />} />
          <Route path="/doctors/tickets" element={<DoctorTickets />} />
          <Route path="/doctors/tickets/:id" element={<DoctorTicketDetails />} />
          <Route path="/doctors/service-order/:id" element={<ServiceOrder />} />
          <Route path="/doctors/record-result/:id" element={<RecordResult />} />
          <Route path="/doctors/medicine-selector" element={<MedicineSelector />} />
          <Route path="/doctors/clinical-services" element={<ClinicalServices />} />
          <Route path="/doctors/result-summary" element={<ResultSummary />} />
          <Route path="/doctors/notifications" element={<Notifications />} />
        </Route>
        <Route element={<RequireRole allowedRoles={['RECEPTIONIST', 'STAFF']} />}>
          <Route path={RECEPTIONIST_PATHS.TODAY_ORDERS} element={<TodayOrders />} />
          <Route path={RECEPTIONIST_PATHS.NEW_RECEPTION} element={<NewReception />} />
          <Route path={RECEPTIONIST_PATHS.NOTIFICATIONS} element={<ReceptionistNotifications />} />
          <Route path={RECEPTIONIST_PATHS.PAYMENT} element={<ReceptionistPayment />} />
        </Route>
        <Route element={<RequireRole allowedRoles={['TECHNICIAN']} />}>
          <Route path={TECH_PATHS.HOME} element={<TechHome />} />
          <Route path={`${TECH_PATHS.RECORD_RESULT}/:id`} element={<TechRecordResult />} />
          <Route path={TECH_PATHS.MEDICINE_SELECTOR} element={<TechMedicineSelector />} />
          <Route path={TECH_PATHS.NOTIFICATIONS} element={<TechNotifications />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
