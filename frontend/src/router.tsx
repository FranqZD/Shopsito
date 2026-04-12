import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home/Home'));
const Login = lazy(() => import('./pages/Login/Login'));
const Register = lazy(() => import('./pages/Register/Register'));
const Catalog = lazy(() => import('./pages/Catalog/Catalog'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard/SellerDashboard'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/catalog', element: <Catalog /> },
  { path: '/dashboard', element: <SellerDashboard /> },
  { path: '/profile', element: <Profile /> },
  { path: '*', element: <NotFound /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
