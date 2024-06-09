"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { AuthError, User } from "@supabase/supabase-js"; // AuthError のインポート

interface UserContextType {
  user: User | null;
  error: AuthError | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export default function UserProviderWrapper({
  user,
  error,
  children,
}: {
  user: User | null;
  error: AuthError | null;
  children: React.ReactNode;
}) {
  return (
    <UserContext.Provider value={{ user, error }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
