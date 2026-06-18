import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Lenis from 'lenis';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { LandingPage } from './LandingPage';
import { LoginPage } from './LoginPage';
import { WaitlistPage } from './WaitlistPage';
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

const waitlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/waitlist',
  component: WaitlistPage,
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, waitlistRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function Root() {
  useEffect(() => {
    // Fast, snappy smooth scroll (higher lerp = quicker catch-up).
    const lenis = new Lenis({
      lerp: 0.14,
      wheelMultiplier: 1.15,
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
