import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from './context/AuthContext';
import { changePassword } from './services/users';
import AppRoutes from './router';
import './styles.css';

const App = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const showNav = !['/login', '/signup'].includes(location.pathname);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = React.useState<string | null>(null);
  const [globalToast, setGlobalToast] = React.useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  React.useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail as { message: string; type: 'success' | 'error' };
      setGlobalToast(detail);
      window.setTimeout(() => setGlobalToast(null), 3000);
    };
    window.addEventListener('api-error', handler);
    return () => window.removeEventListener('api-error', handler);
  }, []);

  return (
    <div className="app">
      {showNav && (
        <header className="navbar">
          <div className="logo">Team Task Manager</div>
          <nav className="nav-links">
            <Link to="/">Dashboard</Link>
            <Link to="/tasks">Tasks</Link>
            {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
            {(user?.role === 'lead' || user?.role === 'admin') && <Link to="/teams">Teams</Link>}
          </nav>
          <div className="nav-actions">
            {user && (
              <span className="user-chip">
                {user.name} · {user.role}
              </span>
            )}
            {user && (
              <button className="btn secondary" onClick={() => setShowPasswordModal(true)}>
                Change Password
              </button>
            )}
            <button className="btn" onClick={() => logout()}>
              Logout
            </button>
          </div>
        </header>
      )}
      <main className="main">
        <AppRoutes />
      </main>
      {globalToast && <div className={`toast ${globalToast.type}`}>{globalToast.message}</div>}
      {showPasswordModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="card">
              <div className="card-header">
                <h3>Change Password</h3>
                <button className="btn secondary" onClick={() => setShowPasswordModal(false)}>
                  Close
                </button>
              </div>
              {passwordError && <div className="error">{passwordError}</div>}
              {passwordSuccess && <div className="toast success">{passwordSuccess}</div>}
              <div className="form">
                <label>
                  Current Password
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                  />
                </label>
                <label>
                  New Password
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                  />
                </label>
                <label>
                  Confirm Password
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                  />
                </label>
                <div className="card-actions">
                  <button
                    className="btn"
                    type="button"
                    onClick={async () => {
                      setPasswordError(null);
                      setPasswordSuccess(null);
                      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                        setPasswordError('Passwords do not match');
                        return;
                      }
                      try {
                        const res = await changePassword({
                          currentPassword: passwordForm.currentPassword,
                          newPassword: passwordForm.newPassword,
                        });
                        setPasswordSuccess(res.message);
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                      } catch {
                        setPasswordError('Failed to update password');
                      }
                    }}
                  >
                    Update Password
                  </button>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
