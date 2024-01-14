import { Suspense, lazy } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { SvgIcon } from '@/components/icon';
import { CircleLoading } from '@/components/loading';

import { AppRouteObject } from '#/router';

const AccountPage = lazy(() => import(`@/pages/token/account`));

const token: AppRouteObject = {
  order: 10,
  path: 'token',
  element: (
    <Suspense fallback={<CircleLoading />}>
      <Outlet />
    </Suspense>
  ),
  meta: {
    label: 'sys_info.menu.dashboard',
    icon: <SvgIcon icon="ic-analysis" className="ant-menu-item-icon" size="24" />,
    key: '/token',
  },
  children: [
    {
      index: true,
      element: <Navigate to="account" replace />,
    },
    {
      path: 'account',
      element: <AccountPage />,
      meta: { label: 'sys_info.menu.account', key: '/token/account' },
    },
  ],
};

export default token;
