import { Navigate, Route, Routes as Switch } from "react-router-dom";
import { NotFoundPage } from "../pages/not-found"
import { routes } from "./RouteIndex";
import { HomePage } from "../pages/home";

export const Routes = () => {
  return (
    <Switch>
      <Route path={routes.home} element={<HomePage />} />
      <Route path={routes.root} element={<Navigate to={routes.home} />} />
      <Route path="*" element={<NotFoundPage />} />
    </Switch>
  );
};