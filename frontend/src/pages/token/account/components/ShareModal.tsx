import {
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Typography
} from "antd";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import LabelWithInfo from "@/pages/components/form/label";
import dayjs from "dayjs";
import {AddShareReq} from "@/api/services/shareService.ts";

export type ShareModalProps = {
  formValue: AddShareReq;
  title: string;
  show: boolean;
  onOk: (values: AddShareReq, callback: any) => void;
  onCancel: VoidFunction;
};

export function ShareModal({ title, show, formValue, onOk, onCancel }: ShareModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const mode = title === 'Edit' || title === '编辑' ? 'edit' : 'create';

  useEffect(() => {
    form.setFieldsValue({ ...formValue, expiresAt: formValue.expiresAt ? dayjs(formValue.expiresAt) : undefined});
  }, [formValue, form]);

  const onModalOk = () => {
    form.validateFields().then((values) => {
      const date = values.expiresAt;
      values.expiresAt = date ? date.format('YYYY-MM-DD') : undefined;
      onOk(values, setLoading);
    });
  };

  const limitFormatter = (value: number | undefined) => {
    console.log(value);
    switch (value) {
      case -1:
        return '无限制';
      case 0:
        return '禁用';
      default:
        return `${value}`;
    }
  }

  const limitParser = (value: string | undefined) => {
    switch (value) {
      case '无限制':
        return -1;
      case '禁用':
        return 0;
      default:
        return parseInt(value!);
    }
  }


  return (
    <Modal
      title={title}
      open={show}
      onOk={onModalOk}
      getContainer={false}
      onCancel={() => {
        // form.resetFields();
        onCancel();
      }}
      okButtonProps={{
        loading,
      }}
      destroyOnClose={false}
    >
      <Form initialValues={formValue} form={form} layout="vertical" preserve={false}>
        <Form.Item<AddShareReq> name="id" hidden>
          <Input />
        </Form.Item>
        <Form.Item<AddShareReq> name="shareType" hidden>
          <Input />
        </Form.Item>
        {formValue.shareType === 'chatgpt' && <Form.Item<AddShareReq> name="shareToken" hidden>
          <Input />
        </Form.Item>}
        <Form.Item<AddShareReq> name="accountId" hidden>
          <Input />
        </Form.Item>
        <Form.Item<AddShareReq> label="Unique Name" name="uniqueName" required>
          <Input readOnly={mode === 'edit'} disabled={mode === 'edit'} />
        </Form.Item>
        <Form.Item<AddShareReq> label={t('token.password')} name="password" required>
          <Input.Password />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<AddShareReq> label={t('token.expiresAt')} name="expiresAt" >
              <DatePicker style={{ width: '100%' }}
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
          {formValue.shareType === 'chatgpt' &&<Col span={12}>
            <Form.Item<AddShareReq> label={t('token.siteLimit')} name="siteLimit">
              <Input placeholder="eg: https://demo.oaifree.com" />
            </Form.Item>
          </Col>}
        </Row>
        {formValue.shareType === 'chatgpt' &&
          <Space direction={"vertical"} className={'w-full'}>
            {/*<Alert message="限制模型的使用次数" type="info"/>*/}
            <Typography.Text>模型使用次数限制：</Typography.Text>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item<AddShareReq> label={'4o-mimi'} name="gpt4oMiniLimit">
                  <InputNumber<number>
                    style={{ width: '100%' }}
                    formatter={limitFormatter}
                    parser={limitParser}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item<AddShareReq> label={'4o'} name="gpt4oLimit">
                  <InputNumber<number>
                    style={{ width: '100%' }}
                    formatter={limitFormatter}
                    parser={limitParser}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item<AddShareReq> label={'gpt4'} name="gpt4Limit">
                  <InputNumber<number>
                    style={{ width: '100%' }}
                    formatter={limitFormatter}
                    parser={limitParser}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item<AddShareReq> label={'o1'} name="o1Limit">
                  <InputNumber<number>
                    style={{ width: '100%' }}
                    formatter={limitFormatter}
                    parser={limitParser}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item<AddShareReq> label={'o1-mini'} name="o1MiniLimit">
                  <InputNumber<number>
                    style={{ width: '100%' }}
                    formatter={limitFormatter}
                    parser={limitParser}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Space>

        }

        {formValue.shareType === 'chatgpt' && <Row>
          <Col span={8}>
            <Form.Item<AddShareReq>
              label={
                <LabelWithInfo label={t('token.refreshEveryday')} info="刷新次数限制的频率, 勾选后将每天刷新上面设置的限额次数" />
              }
              name="refreshEveryday"
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item<AddShareReq>
              label={t('token.showConversations')}
              name="showConversations"
              valuePropName="checked"
            >
              <Checkbox defaultChecked />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item<AddShareReq>
              label={t('token.temporaryChat')}
              name="temporaryChat"
              valuePropName="checked"
            >
              <Checkbox defaultChecked />
            </Form.Item>
          </Col>
        </Row>}
        <Form.Item<AddShareReq> label={t('token.comment')} name="comment">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
}
