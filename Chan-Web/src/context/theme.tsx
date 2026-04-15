import { ConfigProvider, theme } from "antd";
import { createContext, useContext, useState, type ReactNode } from "react";

interface ThemeContextValue {
  setPrimaryColor: (color: string) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  setPrimaryColor: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [primaryColor, setPrimaryColor] = useState<string>("#90bedf");

  return (
    <ThemeContext.Provider value={{ setPrimaryColor }}>
      <ConfigProvider
        theme={{
          algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
          token: {
            borderRadius: 1.5,
            wireframe: false,
            colorPrimary: primaryColor,
            colorInfo: "#90bedf",
            colorBgBase: "#353535",
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
