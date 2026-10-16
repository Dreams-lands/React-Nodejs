import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "info", duration = 3500) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  const clearNotification = () => setNotification(null);

  return (
    <AppContext.Provider
      value={{
        notification,
        showNotification,
        clearNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp phải được sử dụng bên trong AppProvider");
  }
  return context;
};

export default AppContext;
