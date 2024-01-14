import { useCallback, useEffect } from 'react';

import { useUserToken } from '@/store/userStore';

import { useRouter } from '../hooks';
import {useLocation} from "react-router-dom";
type Props = {
  children: React.ReactNode;
};
export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const location = useLocation()
  const { accessToken } = useUserToken();

  const check = useCallback(() => {
    console.log(location.pathname)
    if (!accessToken && location.pathname !== '/login') {
      router.replace('/login');
    }
  }, [router, accessToken]);

  useEffect(() => {
    check();
  }, [check]);

  return children;
}
