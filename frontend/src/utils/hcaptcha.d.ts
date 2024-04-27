declare module '@hcaptcha/react-hcaptcha' {
  import React from 'react';

  interface HCaptchaProps {
    sitekey: string;
    onVerify: (token: string) => void;
    style?: React.CSSProperties;
    // 根据需要添加更多属性
  }

  export default class HCaptcha extends React.Component<HCaptchaProps, any> {}
}
