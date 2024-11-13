import {Modal, Input, message, Spin, Flex, Typography, Alert} from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { QRCode } from "react-qrcode-logo"; // 导入二维码库
import sysService from "@/api/services/sysService.ts";

const MfaBindingModal = (
  { isOpen, onClose, onVerify } : { isOpen: boolean; onClose: () => void; onVerify: (code: string, secret: string) => void }
) => {
  // 维护用户输入的MFA代码
  const [mfaCode, setMfaCode] = useState("");

  // 获取二维码的 URL
  const { data, isLoading, isError } = useQuery({
    queryKey: ["mfa-secret"],
    queryFn: sysService.getMfaSecretUrl,
    enabled: isOpen,
  });

  // 处理用户输入变化
  const handleCodeChange = (value: string) => {
    setMfaCode(value);
  };

  // 点击“验证”按钮时触发
  const handleVerify = () => {
    if (!mfaCode) {
      message.error("请输入MFA代码！");
      return;
    }
    // 触发父组件传入的验证函数
    onVerify(mfaCode, data.secret);
  };

  return (
    <Modal
      title="绑定MFA"
      visible={isOpen}
      onCancel={onClose}
      onOk={handleVerify}
      okText="验证"
      cancelText="取消"
    >
      <Flex justify={"center"} wrap={'wrap'} gap={"middle"}>
        <Typography.Title level={4} style={{textAlign: "center"}}>请使用Google Authenticator等APP扫描二维码</Typography.Title>
        {/* 加载状态或错误信息显示 */}
        {isLoading ? (
          <Spin/>
        ) : isError ? (
          <p>获取二维码失败，请稍后重试。</p>
        ) : (
          <Flex justify={'center'} wrap={'wrap'} style={{textAlign: "center"}}>
            {/* 渲染二维码 */}
            <QRCode value={data?.url} size={200}/>
            <Typography.Text style={{width: '100%'}} code copyable>{data?.secret}</Typography.Text>
          </Flex>
        )}
        {/* 用户输入的MFA代码 */}
        <Input.OTP
          autoFocus={isOpen}
          length={6}
          value={mfaCode}
          onChange={handleCodeChange}
        />
        <Alert type={"warning"} message={"绑定成功后, 你可以在配置文件中清空2fa_secret来强制解绑"} closable />
      </Flex>
    </Modal>
  );
};

export default MfaBindingModal;
