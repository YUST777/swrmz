import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// self-hosted so the hero never waits on a third-party font request.
// Mulish carries headings and UI, Inter the body copy; Geist Mono stays for
// anything that has to read as terminal output.
import '@fontsource-variable/mulish'
import '@fontsource-variable/inter'
import '@fontsource-variable/geist-mono'

import { routeTree } from './routeTree.gen'
import './styles.css'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
