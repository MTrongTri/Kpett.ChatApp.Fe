import Cookies from 'js-cookie';

const SESSION_LOGGED_IN = 'isLoggedIn';
const SESSION_PROFILE = 'isProfileCompleted';

export const sessionStorage = {
  setSession: ({ isProfileCompleted }: { isProfileCompleted: boolean }) => {
    Cookies.set(SESSION_LOGGED_IN, 'true', { sameSite: 'lax', expires: 365 });
    Cookies.set(SESSION_PROFILE, String(isProfileCompleted), { sameSite: 'lax', expires: 365 });
  },

  clearSession: () => {
    Cookies.remove(SESSION_LOGGED_IN);
    Cookies.remove(SESSION_PROFILE);
  },

  updateProfileCompleted: () => {
    Cookies.set(SESSION_PROFILE, 'true', { sameSite: 'lax', expires: 365 });
  },
};