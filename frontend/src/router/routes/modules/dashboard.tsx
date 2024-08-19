import { lazy } from 'react';
import { SvgIcon } from '@/components/icon';

import { AppRouteObject } from '#/router';

const Analysis = lazy(() => import('@/pages/dashboard/analysis'));

const dashboard: AppRouteObject = {
  order: 1,
  path: '/admin/home',
  element: <Analysis />,
  meta: {
    label: '欢迎',
    icon: <SvgIcon icon="ic-analysis" className="ant-menu-item-icon" size="24" />,
    key: '/admin/home',
  }
};

export default dashboard;
