import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { LandingPage } from './LandingPage';
import { LoginPage } from './LoginPage';
import { SoonPage } from './SoonPage';
import './styles.css';

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const soonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/soon',
  component: SoonPage,
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, soonRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
