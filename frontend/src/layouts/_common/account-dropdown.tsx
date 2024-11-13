import {Divider, MenuProps, notification} from 'antd';
import Dropdown, { DropdownProps } from 'antd/es/dropdown/dropdown';
import React, {useState} from 'react';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/icon';
import { useLoginStateContext } from '@/pages/sys/login/providers/LoginStateProvider';
import { useRouter } from '@/router/hooks';
import { useUserInfo, useUserActions } from '@/store/userStore';
import { useThemeToken } from '@/theme/hooks';
import avatar from '@/assets/images/qinshihuang.jpg';
import MfaBindingModal from "@/layouts/_common/mfa-modal.tsx";
import sysService from "@/api/services/sysService.ts";


/**
 * Account Dropdown
 */
export default function AccountDropdown() {
  const { replace } = useRouter();
  const { username, email } = useUserInfo();
  const { clearUserInfoAndToken } = useUserActions();
  const { backToLogin } = useLoginStateContext();
  const { t } = useTranslation();
  const logout = () => {
    try {
      clearUserInfoAndToken();
      backToLogin();
    } catch (error) {
      console.log(error);
    } finally {
      replace('/admin/login');
    }
  };
  const { colorBgElevated, borderRadiusLG, boxShadowSecondary } = useThemeToken();
  const [mfaModalVisible, setMfaModalVisible] = useState(false);

  const contentStyle: React.CSSProperties = {
    backgroundColor: colorBgElevated,
    borderRadius: borderRadiusLG,
    boxShadow: boxShadowSecondary,
  };

  const menuStyle: React.CSSProperties = {
    boxShadow: 'none',
  };

  const dropdownRender: DropdownProps['dropdownRender'] = (menu) => (
    <div style={contentStyle}>
      <div className="flex flex-col items-start p-4">
        <div>{username}</div>
        <div className="text-gray">{email}</div>
      </div>
      <Divider style={{ margin: 0 }} />
      {React.cloneElement(menu as React.ReactElement, { style: menuStyle })}
    </div>
  );

  const items: MenuProps['items'] = [
    {
      label: <button>2FA认证</button>,
      key: '2',
      onClick: () => setMfaModalVisible(true),
    },
    { type: 'divider' },
    {
      label: <button className="font-bold text-warning">{t('sys.login.logout')}</button>,
      key: '3',
      onClick: logout,
    },
  ];

  const handleVerify = (mfaCode: string, secret: string) => {
    sysService.verifyMfa(mfaCode, secret).then(res => {
      console.log(res);
      setMfaModalVisible(false);
    }).catch(err => {
      console.log(err);
      notification.error({ message: 'MFA验证失败' });
    })
  }

  return (
    <>
      <Dropdown menu={{ items }} trigger={['click']} dropdownRender={dropdownRender}>
        <IconButton className="h-10 w-10 transform-none px-0 hover:scale-105">
          <img className="h-8 w-8 rounded-full" src={avatar} alt="" />
        </IconButton>
      </Dropdown>
      <MfaBindingModal isOpen={mfaModalVisible} onVerify={handleVerify} onClose={() => setMfaModalVisible(false)}/>
    </>
  );
}
