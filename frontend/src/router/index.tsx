import React from 'react';
import { Route, Routes } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import TasksPage from '../pages/TasksPage';
import TeamsPage from '../pages/TeamsPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <AdminDashboardPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/tasks"
      element={
        <ProtectedRoute>
          <TasksPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/teams"
      element={
        <RoleRoute allow={['lead', 'admin']}>
          <TeamsPage />
        </RoleRoute>
      }
    />
  </Routes>
);

export default AppRoutes;
