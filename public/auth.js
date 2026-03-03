// auth.js — MSAL Browser authentication for AI Agent Frontend
// Uses msal-browser loaded via CDN in index.html

const msalConfig = {
  auth: {
    clientId: window.__ENV__?.ENTRA_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${window.__ENV__?.ENTRA_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};

let msalInstance = null;

function getMsalInstance() {
  if (!msalInstance) {
    msalInstance = new msal.PublicClientApplication(msalConfig);
  }
  return msalInstance;
}

/**
 * Sign in the user with a popup.
 * @returns {Promise<msal.AuthenticationResult>}
 */
async function login() {
  const instance = getMsalInstance();
  const response = await instance.loginPopup(loginRequest);
  instance.setActiveAccount(response.account);
  return response;
}

/**
 * Sign out the current user with a popup.
 */
async function logout() {
  const instance = getMsalInstance();
  const account = instance.getActiveAccount();
  await instance.logoutPopup({ account });
}

/**
 * Acquire an access token silently, falling back to a popup if needed.
 * @param {string[]} scopes - The scopes to request.
 * @returns {Promise<string>} Bearer access token.
 */
async function getAccessToken(scopes = ['openid', 'profile']) {
  const instance = getMsalInstance();
  const account = instance.getActiveAccount();
  if (!account) {
    throw new Error('No active account. Please sign in first.');
  }
  try {
    const response = await instance.acquireTokenSilent({ scopes, account });
    return response.accessToken;
  } catch (err) {
    if (err instanceof msal.InteractionRequiredAuthError) {
      const response = await instance.acquireTokenPopup({ scopes, account });
      return response.accessToken;
    }
    throw err;
  }
}

/**
 * Returns the currently active account, or null.
 */
function getActiveAccount() {
  const instance = getMsalInstance();
  return instance.getActiveAccount();
}

/**
 * Initialise MSAL and restore any cached login state.
 * Call this once on page load.
 */
async function initAuth() {
  const instance = getMsalInstance();
  await instance.initialize();
  // Handle redirect response (not used in popup flow, but good practice)
  await instance.handleRedirectPromise();
  // Restore the first cached account as active
  const accounts = instance.getAllAccounts();
  if (accounts.length > 0) {
    instance.setActiveAccount(accounts[0]);
  }
}
