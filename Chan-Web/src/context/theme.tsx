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
            colorPrimary: primaryColor,
            colorInfo: "#90bedf",
            colorBgBase: "#353535",
            wireframe: true,
            lineWidth: 2,
            boxShadow: "none",
            boxShadowSecondary: "none",
            boxShadowTertiary: "none",
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
