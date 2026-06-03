// ============================================================
// Simple auth utility for admin panel.
// Credentials are checked client-side.
// ============================================================

const ADMIN_USERNAME = 'mahek';
const ADMIN_PASSWORD = '1234';
const AUTH_KEY = 'naturelens_admin_auth';

/** Validate credentials and set session */
export function login(username, password) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
}

/** Check if user is currently authenticated */
export function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

/** Clear auth session */
export function logout() {
  sessionStorage.removeItem(AUTH_KEY);
}
