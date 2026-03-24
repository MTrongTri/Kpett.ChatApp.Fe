// hooks/useAuthSync.js
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Cookies from "js-cookie";

export function useAuthSync() {
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    Cookies.set(
      "auth-state",
      JSON.stringify({
        isLoggedIn: auth.user,
        isProfileCompleted: auth.isProfileCompleted,
      }),
      { expires: 7 },
    );
  }, [auth.user, auth.isProfileCompleted]);
}
