export interface Env {
  publicUrl: string;
  apiBaseUrl?: string;
  wsBaseUrl?: string;
  host: string;
  subdirectory?: string;
  appRoot: string;
}

const subdirectory = import.meta.env.VITE_SUBDIRECTORY;
const host = `${window.location.protocol}//${window.location.host}`;
const appRoot = `${host}${subdirectory}`;

export const EnvVars: Env = {
  publicUrl: import.meta.env.PUBLIC_URL,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL,
  host,
  subdirectory,
  appRoot,
};
