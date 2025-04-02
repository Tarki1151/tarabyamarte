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

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
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
    </Routes>
  );
}

export default App;