import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import JobsPage from './pages/JobsPage';
import MessagesPage from './pages/MessagesPage';
import GroupsPage from './pages/GroupsPage';
import NetworkPage from './pages/NetworkPage';
import CompaniesPage from './pages/CompaniesPage';
import NotificationsPage from './pages/NotificationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminDashboard from './pages/AdminDashboard';
import SearchPage from './pages/SearchPage';
import SavedPostPage from './pages/SavedPostsPage'
import './App.css';
import Header from './components/Header';
import HelpSupportPage from './pages/HelpSupportPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <Router>
            <div className="App">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <HomePage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile/:userId"
                    element={
                      <PrivateRoute>
                        <ProfilePage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <ProfilePage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/jobs"
                    element={
                      <PrivateRoute>
                        <JobsPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/messages"
                    element={
                      <PrivateRoute>
                        <MessagesPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/saved"
                    element={
                      <PrivateRoute>
                        <SavedPostPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/help"
                    element={
                      <PrivateRoute>
                        <HelpSupportPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <PrivateRoute>
                        <SettingsPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/groups"
                    element={
                      <PrivateRoute>
                        <GroupsPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/network"
                    element={
                      <PrivateRoute>
                        <NetworkPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/companies"
                    element={
                      <PrivateRoute>
                        <CompaniesPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <PrivateRoute>
                        <NotificationsPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <PrivateRoute>
                        <AnalyticsPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <PrivateRoute>
                        <AdminDashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/search"
                    element={
                      <PrivateRoute>
                        <SearchPage />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </main>
            </div>
          </Router>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
