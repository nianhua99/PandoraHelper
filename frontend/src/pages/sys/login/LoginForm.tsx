import { Button, Form, Input } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SignInReq } from '@/api/services/userService';
import { useSignIn } from '@/store/userStore';
import {useCaptchaSiteKey} from "@/store/settingStore.ts";
import HCaptcha from "@hcaptcha/react-hcaptcha";


function LoginForm() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(undefined);

  const captchaSiteKey = useCaptchaSiteKey();

  const signIn = useSignIn();

  const handleFinish = async ({ password }: SignInReq) => {
    console.log(captchaToken);
    setLoading(true);
    try {
      await signIn({ password, token: captchaToken });
    } finally {
      setLoading(false);
    }
  };
  // @ts-ignore
  return (
    <>
      <div className="mb-4 text-2xl font-bold xl:text-3xl">{t('sys.login.signInFormTitle')}</div>
      <Form
        form={form}
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
        {captchaSiteKey &&
          <div className="flex flex-row justify-center">
            <Form.Item
              name="token"
            >
              <HCaptcha sitekey={captchaSiteKey} onVerify={setCaptchaToken}/>
            </Form.Item>
          </div>
        }
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
