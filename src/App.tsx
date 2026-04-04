import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { BookingsPage } from "./pages/BookingsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { GalleryPage } from "./pages/GalleryPage";
import { ServicesPage } from "./pages/ServicesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { VehiclesPage } from "./pages/VehiclesPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "rezerwacje",
        element: <BookingsPage />,
      },
      {
        path: "klienci",
        element: <CustomersPage />,
      },
      {
        path: "pojazdy",
        element: <VehiclesPage />,
      },
      {
        path: "uslugi",
        element: <ServicesPage />,
      },
      {
        path: "galeria",
        element: <GalleryPage />,
      },
      {
        path: "ustawienia",
        element: <SettingsPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
