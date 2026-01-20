import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiLogin, apiLogout, apiMe, apiOtpVerify } from "../api/authApi.js";
import { clearAuthToken, getAuthToken, setAuthToken } from "./tokenStorage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAuthToken());
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [status, setStatus] = useState("loading");

  const applySession = useCallback((data) => {
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user || null);
  }, []);

  const refresh = useCallback(async () => {
    const currentToken = getAuthToken();

    if (!currentToken) {
      setToken(null);
      setUser(null);
      setMember(null);
      setStatus("ready");
      return;
    }

    try {
      const data = await apiMe({ token: currentToken });
      setToken(currentToken);
      setUser(data.user || null);
      setMember(data.member || null);
    } catch (err) {
      console.log("Session expired / invalid token:", err);
      clearAuthToken();
      setToken(null);
      setUser(null);
      setMember(null);
    } finally {
      setStatus("ready");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback(
    async ({ username, password }) => {
      const data = await apiLogin({ username, password });
      applySession(data);
      await refresh(); // ✅ fetch full user + member
      return data;
    },
    [applySession, refresh]
  );

  const signInWithOtp = useCallback(
    async ({ challenge_id, otp }) => {
      const data = await apiOtpVerify({ challenge_id, otp });
      applySession(data);
      await refresh();
      return data;
    },
    [applySession, refresh]
  );

  const signOut = useCallback(async () => {
    const currentToken = getAuthToken();

    if (currentToken) {
      try {
        await apiLogout({ token: currentToken });
      } catch (err) {
        console.log("Logout error:", err);
      }
    }

    clearAuthToken();
    setToken(null);
    setUser(null);
    setMember(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      member,
      status,
      signIn,
      signInWithOtp,
      signOut,
      refresh,
    }),
    [token, user, member, status, signIn, signInWithOtp, signOut, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
