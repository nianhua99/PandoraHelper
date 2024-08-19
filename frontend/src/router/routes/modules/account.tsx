import { Suspense, lazy } from 'react';
import { Outlet } from 'react-router-dom';

import { CircleLoading } from '@/components/loading';

import { AppRouteObject } from '#/router';
import Iconify from "../../../components/icon/iconify-icon.tsx";

const ChatGPTAccount = lazy(() => import(`@/pages/token/account/chatgpt`));
const ClaudeAccount = lazy(() => import(`@/pages/token/account/claude`));

const account: AppRouteObject = {
  path: '/admin/account',
  element: (
    <Suspense fallback={<CircleLoading />}>
      <Outlet />
    </Suspense>
  ),
  meta: {
    label: '账号管理',
    icon: <Iconify icon="mdi:account" className="ant-menu-item-icon" size="24" />,
    key: '/admin/account'
  },
  children: [
    {
      path: 'chatgpt',
      element: <ChatGPTAccount />,
      meta: {
        label: 'ChatGPT',
        icon: <Iconify icon='simple-icons:openai' className="ant-menu-item-icon" size="24" />,
        key: '/admin/account/chatgpt'
      }
    },
    {
      path: 'claude',
      element: <ClaudeAccount />,
      meta: {
        label: 'Claude',
        icon: <Iconify icon='simple-icons:anthropic' className="ant-menu-item-icon" size="24" />,
        key: '/admin/account/claude'
      }
    }
  ]
};

export default account;
