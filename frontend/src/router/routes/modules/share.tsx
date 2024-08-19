import { Suspense, lazy } from 'react';
import { Outlet } from 'react-router-dom';

import { CircleLoading } from '@/components/loading';

import { AppRouteObject } from '#/router';
import Iconify from "../../../components/icon/iconify-icon.tsx";

const ChatGPTShare = lazy(() => import(`@/pages/token/share/chatgpt`));
const ClaudeShare = lazy(() => import(`@/pages/token/share/claude`));

const account: AppRouteObject = {
  path: '/admin/share',
  element: (
    <Suspense fallback={<CircleLoading />}>
      <Outlet />
    </Suspense>
  ),
  meta: {
    label: '共享管理',
    icon: <Iconify icon="lucide:share-2" className="ant-menu-item-icon" size="24" />,
    key: '/admin/share'
  },
  children: [
    {
      path: 'chatgpt',
      element: <ChatGPTShare />,
      meta: {
        label: 'ChatGPT',
        icon: <Iconify icon='simple-icons:openai' className="ant-menu-item-icon" size="24" />,
        key: '/admin/share/chatgpt'
      }
    },
    {
      path: 'claude',
      element: <ClaudeShare />,
      meta: {
        label: 'Claude',
        icon: <Iconify icon='simple-icons:anthropic' className="ant-menu-item-icon" size="24" />,
        key: '/admin/share/claude'
      }
    }
  ]
};

export default account;
