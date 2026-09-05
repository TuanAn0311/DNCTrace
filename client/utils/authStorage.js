const TOKEN_KEY = "token";
const USER_KEY = "user";

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
};

export const setStoredSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const updateStoredUser = (user) => {
  const current = getStoredUser() || {};
  localStorage.setItem(USER_KEY, JSON.stringify({ ...current, ...user }));
};

export const clearStoredSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
