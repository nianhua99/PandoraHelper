import { Button, Form, Input } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SignInReq } from '@/api/services/userService';
import { useSignIn } from '@/store/userStore';

function LoginForm() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const signIn = useSignIn();

  const handleFinish = async ({ password }: SignInReq) => {
    setLoading(true);
    try {
      await signIn({ password });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="mb-4 text-2xl font-bold xl:text-3xl">{t('sys.login.signInFormTitle')}</div>
      <Form
        name="login"
        size="large"
        onFinish={handleFinish}
      >
        <Form.Item
          name="password"
          rules={[{ required: true, message: t('sys.login.passwordPlaceholder') }]}
        >
          <Input.Password type="password" placeholder={t('sys.login.password')} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
            {t('sys.login.loginButton')}
          </Button>
        </Form.Item>

      </Form>
    </>
  );
}

export default LoginForm;
