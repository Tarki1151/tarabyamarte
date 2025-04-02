import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProgramsListPage from './pages/ProgramsListPage';
import MemberAppointmentsPage from './pages/MemberAppointmentsPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import MemberMembershipsPage from './pages/MemberMembershipsPage';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
// import { useAuth } from './contexts/AuthContext'; // App içinde auth durumuna gerek kalmadı

function App() {
  // Auth durumu artık AuthContext ve PrivateRoute tarafından yönetiliyor.
  // const { isAuthenticated } = useAuth(); // Burada kontrol etmeye gerek yok

  return (
    <Routes>
      {/* Giriş Sayfası */}
      <Route path="/login" element={<LoginPage />} />

      {/* Giriş Yapılmış Alanlar (Layout ve PrivateRoute ile korunur) */}
      <Route
        path="/"
        element={
          <PrivateRoute> {/* PrivateRoute artık context'i kullanacak */}
            <Layout />
          </PrivateRoute>
        }
      >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="programs" element={<ProgramsListPage />} />
          <Route path="my-memberships" element={<MemberMembershipsPage />} />
          <Route path="my-appointments" element={<MemberAppointmentsPage />} />
          <Route path="book-appointment" element={<BookAppointmentPage />} />
      </Route>

      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

export default App;
