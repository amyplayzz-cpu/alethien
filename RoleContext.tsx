import { createContext, useContext, useState, ReactNode } from "react";

type UserRole = "admin" | "teacher" | null;

type UserInfo = {
  id: number;
  username: string;
  displayName: string;
  role: UserRole;
} | null;

type RoleContextType = {
  userInfo: UserInfo;
  setUserInfo: (info: UserInfo) => void;
  logout: () => void;
};

const RoleContext = createContext<RoleContextType>({
  userInfo: null,
  setUserInfo: () => {},
  logout: () => {},
});

export const useRole = () => useContext(RoleContext);

type RoleProviderProps = {
  children: ReactNode;
};

export const RoleProvider = ({ children }: RoleProviderProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo>(() => {
    const savedUser = localStorage.getItem("alethien-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleSetUserInfo = (info: UserInfo) => {
    setUserInfo(info);
    if (info) {
      localStorage.setItem("alethien-user", JSON.stringify(info));
    } else {
      localStorage.removeItem("alethien-user");
    }
  };

  const logout = () => {
    handleSetUserInfo(null);
  };

  return (
    <RoleContext.Provider
      value={{
        userInfo,
        setUserInfo: handleSetUserInfo,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};
