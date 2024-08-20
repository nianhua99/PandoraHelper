import { lazy } from 'react';
import {
  RouteObject,
  RouterProvider,
  createBrowserRouter, Navigate
} from 'react-router-dom';

import DashboardLayout from '@/layouts/dashboard';
import { usePermissionRoutes } from '@/router/hooks';
import { ErrorRoutes } from '@/router/routes/error-routes';

import { AppRouteObject } from '#/router';
import AuthGuard from "@/router/components/auth-guard.tsx";

const { VITE_APP_HOMEPAGE: HOMEPAGE } = import.meta.env;
const LoginRoute: AppRouteObject = {
  path: '/admin/login',
  Component: lazy(() => import('@/pages/sys/login/Login')),
};

const ExternalShareRoute: AppRouteObject = {
  path: '/share',
  Component: lazy(() => import('@/pages/share')),
}

export default function Router() {
  const permissionRoutes = usePermissionRoutes();

  const asyncRoutes: AppRouteObject = {
    path: '/admin',
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [{ index: true, element: <Navigate to={HOMEPAGE} replace /> }, ...permissionRoutes],
  };

  const routes = [LoginRoute, asyncRoutes,ExternalShareRoute, ErrorRoutes];

  const router = createBrowserRouter(
    routes as unknown as RouteObject[],
    {
      basename: '/',
    }
  );

  return <RouterProvider router={router} />;
}
