import React, {useEffect} from 'react';

import { useThemeToken } from '@/theme/hooks';

import HeaderSimple from '../_common/header-simple';

type Props = {
  children: React.ReactNode;
};
export default function SimpleLayout({ children }: Props) {

  useEffect(() => {
    document.title = "Pandora Helper"
  }, [])

  const { colorBgElevated, colorTextBase } = useThemeToken();
  return (
    <div
      className="flex h-screen w-full flex-col"
      style={{
        color: colorTextBase,
        background: colorBgElevated,
      }}
    >
      <HeaderSimple />
      {children}
    </div>
  );
}
