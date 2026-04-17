import { AuthProvider } from "./authentication/use-auth";
import { AppLayout } from "./components/layout/app-layout";
import { Routes } from "./routes/RouteConfig";

function App() {
  return (
    <AuthProvider>
      <AppLayout>
        <Routes />
      </AppLayout>
    </AuthProvider>
  );
}

export default App;
