import Cookies from "js-cookie";

const cookieStorage = {
  getItem: (key: string) => {
    return Promise.resolve(Cookies.get(key) ?? null);
  },
  setItem: (key: string, value: string) => {
    Cookies.set(key, value, { expires: 365 });
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    Cookies.remove(key);
    return Promise.resolve();
  },
};

export const tokenStorage = {
  save: (accessToken: string, refreshToken: string) => {
    Cookies.set("access_token", accessToken, {
      expires: 1,
      secure: true,
      sameSite: "strict",
    });
    Cookies.set("refresh_token", refreshToken, {
      expires: 365,
      secure: true,
      sameSite: "strict",
    });
  },
  getAccessToken: () => Cookies.get("access_token") ?? null,
  getRefreshToken: () => Cookies.get("refresh_token") ?? null,
  clear: () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
  },
};

export const setAuthSession = ({
  isProfileCompleted,
}: {
  isProfileCompleted: boolean;
}) => {
  Cookies.set("isLoggedIn", "true", { expires: 365 });
  Cookies.set("isProfileCompleted", String(isProfileCompleted), {
    expires: 365,
  });
};

export const deleteAuthSession = () => {
  Cookies.remove("isLoggedIn");
  Cookies.remove("isProfileCompleted");
};

export default cookieStorage;
