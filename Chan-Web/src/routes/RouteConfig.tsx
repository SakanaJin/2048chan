import { Navigate, Route, Routes as Switch } from "react-router-dom";
import { NotFoundPage } from "../pages/not-found";
import { routes } from "./RouteIndex";
import { DashboardPage } from "../pages/dashboard";

export const Routes = () => {
  return (
    <Switch>
      <Route path={routes.dashboard} element={<DashboardPage />} />
      <Route path={routes.root} element={<Navigate to={routes.dashboard} />} />
      <Route path="*" element={<NotFoundPage />} />
    </Switch>
  );
};
