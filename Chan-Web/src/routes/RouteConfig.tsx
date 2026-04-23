import { Navigate, Route, Routes as Switch } from "react-router-dom";
import { NotFoundPage } from "../pages/not-found";
import { routes } from "./RouteIndex";
import { DashboardPage } from "../pages/dashboard";
import { TopicsPage } from "../pages/topics";
import { TopicPage } from "../pages/topic";
import { ThreadsPage } from "../pages/thread";

export const Routes = () => {
  return (
    <Switch>
      <Route path={routes.dashboard} element={<DashboardPage />} />
      <Route path={routes.topics} element={<TopicsPage />} />
      <Route path={routes.topic} element={<TopicPage />} />
      <Route path={routes.thread} element={<ThreadsPage />} />
      <Route path={routes.root} element={<Navigate to={routes.dashboard} />} />
      <Route path="*" element={<NotFoundPage />} />
    </Switch>
  );
};
