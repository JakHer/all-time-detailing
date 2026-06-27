import { lazy, Suspense } from 'react';
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import { AppShell } from './layout/AppShell';

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
);
const BookingsPage = lazy(() =>
  import('./pages/BookingsPage').then((module) => ({
    default: module.BookingsPage,
  })),
);
const CustomersPage = lazy(() =>
  import('./pages/CustomersPage').then((module) => ({
    default: module.CustomersPage,
  })),
);
const VehiclesPage = lazy(() =>
  import('./pages/VehiclesPage').then((module) => ({
    default: module.VehiclesPage,
  })),
);
const ServicesPage = lazy(() =>
  import('./pages/ServicesPage').then((module) => ({
    default: module.ServicesPage,
  })),
);
const GalleryPage = lazy(() =>
  import('./pages/GalleryPage').then((module) => ({
    default: module.GalleryPage,
  })),
);
const KpiPage = lazy(() =>
  import('./pages/KpiPage').then((module) => ({
    default: module.KpiPage,
  })),
);

const RouteFallback = () => {
  return (
    <div className="grid min-h-120 place-items-center rounded-3xl border border-white/10 bg-white/4 p-6 text-sm text-stone-400 sm:rounded-4xl">
      Ladowanie widoku...
    </div>
  );
};

const withRouteSuspense = (element: JSX.Element) => {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: withRouteSuspense(<DashboardPage />),
      },
      {
        path: 'rezerwacje',
        element: withRouteSuspense(<BookingsPage />),
      },
      {
        path: 'klienci',
        element: withRouteSuspense(<CustomersPage />),
      },
      {
        path: 'pojazdy',
        element: withRouteSuspense(<VehiclesPage />),
      },
      {
        path: 'uslugi',
        element: withRouteSuspense(<ServicesPage />),
      },
      {
        path: 'galeria',
        element: withRouteSuspense(<GalleryPage />),
      },
      {
        path: 'kpi',
        element: withRouteSuspense(<KpiPage />),
      },
      {
        path: 'ustawienia',
        element: <Navigate to="/" replace />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
