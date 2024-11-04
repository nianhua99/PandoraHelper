import {Button, Form, Input, message} from 'antd';
import {useState} from 'react';
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
  const [show2FA, setShow2FA] = useState(false); // 新增 state，用于控制 2FA 输入框的显示

  const captchaSiteKey = useCaptchaSiteKey();
  const signIn = useSignIn();

  const handleFinish = async ({ password,validateCode }: SignInReq) => {
    setLoading(true);
    try {
      const res = await signIn({ password, validateCode:validateCode, token: captchaToken });
      console.log(res);
      if (res && res.status == 1003) {
        // navigate('/admin');
        setShow2FA(true); // 如果返回状态为 1003，显示 2FA 输入框
      }
    } catch (e){
      if (e.response?.data?.status == 1003) {
        setShow2FA(true); // 如果返回状态为 1003，显示 2FA 输入框
        message.error("请输入2FA验证码");
      } else {
        message.error("登录失败");
      }
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
        {show2FA && ( // 仅在 show2FA 为 true 时显示 2FA 输入框
          <Form.Item
            name="validateCode"
            rules={[{ required: true, message: '请输入2FA验证码' }]}
          >
            <Input.OTP autoFocus={show2FA} length={6} />
          </Form.Item>
        )}
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
