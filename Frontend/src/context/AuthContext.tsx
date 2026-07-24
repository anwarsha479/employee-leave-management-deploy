import { createContext, useContext, useEffect, useState } from "react";

import type { ReactNode } from "react";
import { getProfile } from "../services/auth.service";

interface User {
  userId: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    console.log("refreshUser called");

    try {
      console.log("Calling /auth/profile...");
      const response = await getProfile();
      console.log("Profile response:", response.data);

      setUser(response.data);
    } catch (error) {
      console.log("Profile error:", error);
      setUser(null);
    } finally {
      console.log("Loading finished");
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
