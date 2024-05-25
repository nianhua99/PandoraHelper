import {AccountAddReq} from "@/api/services/accountService.ts";
import {Form, Input, Modal, Switch} from "antd";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import Password from "antd/es/input/Password";

export type AccountModalProps = {
  formValue: AccountAddReq;
  title: string;
  show: boolean;
  onOk: (values: AccountAddReq, setLoading: any) => void;
  onCancel: VoidFunction;
};

export function AccountModal({ title, show, formValue, onOk, onCancel }: AccountModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // useEffect(() => {
  //   form.setFieldsValue({...formValue});
  // }, [formValue, form]);

  const onModalOk = () => {
    form.validateFields().then((values) => {
      setLoading(true);
      onOk(values, setLoading);
    });
  };

  return (
    <Modal
      title={title}
      open={show}
      onOk={onModalOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okButtonProps={{
        loading,
      }}
      destroyOnClose={false}
    >
      <Form
        initialValues={formValue}
        form={form}
        layout="vertical"
        preserve={false}
        autoComplete="off"
      >
        <Form.Item<AccountAddReq> name="id" hidden>
          <Input />
        </Form.Item>
        <Form.Item<AccountAddReq> label="Email" name="email" required>
          <Input />
        </Form.Item>
        <Form.Item<AccountAddReq> label={t('token.password')} name="password">
          <Password />
        </Form.Item>
        <Form.Item<AccountAddReq>
          label={t('token.share')}
          name="shared"
          labelAlign="left"
          valuePropName="checked"
          getValueFromEvent={(v) => {
            return v ? 1 : 0;
          }}
          required
        >
          <Switch />
        </Form.Item>
        <Form.Item<AccountAddReq>
          label={
            <a href={"https://token.oaifree.com/auth"} target={"_blank"}>
              Refresh Token(点击获取)
            </a>
          }
          name="refreshToken"
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item<AccountAddReq>
          label={
            <a href={"https://token.oaifree.com/auth"} target={"_blank"}>
              Access Token(点击获取)
            </a>
          }
          name="accessToken"
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
}
