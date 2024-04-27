import {
  CheckCircleTwoTone,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleTwoTone,
  FundOutlined,
  PlusOutlined,
  ReloadOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Space,
  Spin,
  Switch,
  Typography,
} from 'antd';
import Password from 'antd/es/input/Password';
import Table, { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import accountService, { AccountAddReq } from '@/api/services/accountService.ts';
import shareService from '@/api/services/shareService.ts';
import Chart from '@/components/chart/chart.tsx';
import useChart from '@/components/chart/useChart.ts';
import LabelWithInfo from '@/pages/components/form/label';
import {
  useAddAccountMutation,
  useDeleteAccountMutation,
  useRefreshAccountMutation,
  useUpdateAccountMutation,
} from '@/store/accountStore.ts';
import ProTag from '@/theme/antd/components/tag';
import { onCopy } from '@/utils/copy.ts';

import { useAddShareMutation } from '@/store/shareStore.ts';

import { Account, defaultShare, Share } from '#/entity';

type SearchFormFieldType = Pick<Account, 'email'>;

export default function AccountPage() {
  const [searchForm] = Form.useForm();
  const { t } = useTranslation();

  const addAccountMutation = useAddAccountMutation();
  const updateAccountMutation = useUpdateAccountMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const refreshAccountMutation = useRefreshAccountMutation();
  const addShareMutation = useAddShareMutation();

  const navigate = useNavigate();

  const [deleteAccountId, setDeleteAccountId] = useState<number | undefined>(-1);
  const [refreshAccountId, setRefreshAccountId] = useState<number | undefined>(-1);

  const searchEmail = Form.useWatch('email', searchForm);

  const [AccountModalPros, setAccountModalProps] = useState<AccountModalProps>({
    formValue: {
      email: '',
      password: '',
      refreshToken: '',
    },
    title: 'New',
    show: false,
    onOk: (values: AccountAddReq, callback) => {
      if (values.id) {
        updateAccountMutation.mutate(values, {
          onSuccess: () => {
            setAccountModalProps((prev) => ({ ...prev, show: false }));
          },
          onSettled: () => callback(false),
        });
      } else {
        addAccountMutation.mutate(values, {
          onSuccess: () => {
            setAccountModalProps((prev) => ({ ...prev, show: false }));
          },
          onSettled: () => callback(false),
        });
      }
    },
    onCancel: () => {
      setAccountModalProps((prev) => ({ ...prev, show: false }));
    },
  });

  const [shareModalProps, setShareModalProps] = useState<ShareModalProps>({
    formValue: { ...defaultShare },
    title: 'New',
    show: false,
    onOk: (values: Share, callback) => {
      callback(true);
      addShareMutation.mutate(values, {
        onSuccess: () => {
          setShareModalProps((prev) => ({ ...prev, show: false }));
        },
        onSettled: () => {
          callback(false);
        },
      });
    },
    onCancel: () => {
      setShareModalProps((prev) => ({ ...prev, show: false }));
    },
  });

  const [shareInfoModalProps, setShareInfoModalProps] = useState<ShareInfoModalProps>({
    accountId: -1,
    show: false,
    onOk: () => {
      setShareInfoModalProps((prev) => ({ ...prev, show: false }));
    },
  });

  const columns: ColumnsType<Account> = [
    {
      title: t('token.email'),
      dataIndex: 'email',
      ellipsis: true,
      align: 'center',
      render: (text) => (
        <Typography.Text style={{ maxWidth: 200 }} ellipsis>
          {text}
        </Typography.Text>
      ),
    },
    {
      title: t('token.password'),
      dataIndex: 'password',
      align: 'center',
      ellipsis: true,
      render: (text) => (
        <Typography.Text style={{ maxWidth: 200 }} ellipsis>
          {text}
        </Typography.Text>
      ),
    },
    {
      title: 'Refresh Token',
      dataIndex: 'refresh_token',
      align: 'center',
      width: 150,
      render: (_, record) =>
        // 当refreshToken存在时，显示refreshToken，并点击复制，否则显示Emtpy Tag
        record.refreshToken ? (
          <Input
            value={record.refreshToken}
            onClick={(e) => onCopy(record.refreshToken!, t, e)}
            readOnly
          />
        ) : (
          <ProTag color="error">Empty</ProTag>
        ),
    },
    {
      title: 'Access Token',
      dataIndex: 'accessToken',
      align: 'center',
      width: 100,
      render: (_, record) =>
        // 当accessToken存在时，显示accessToken，否则显示Error Tag
        record.accessToken ? (
          <Input
            value={record.accessToken}
            onClick={(e) => onCopy(record.accessToken!, t, e)}
            readOnly
          />
        ) : (
          <ProTag color="error">Empty</ProTag>
        ),
    },
    {
      title: t('token.shareStatus'),
      dataIndex: 'shared',
      align: 'center',
      width: 100,
      render: (_, record) =>
        // 当accessToken存在时，显示accessToken，否则显示Error Tag
        record.shared == 1 ? (
          <CheckCircleTwoTone twoToneColor="#52c41a" />
        ) : (
          <ExclamationCircleTwoTone twoToneColor="#fa8c16" />
        ),
    },
    {
      title: t('token.updateTime'),
      dataIndex: 'updateTime',
      align: 'center',
      width: 200,
    },
    {
      title: t('token.share'),
      key: 'share',
      align: 'center',
      render: (_, record) => (
        <Button.Group>
          <Badge count={record.shareList?.length} style={{ zIndex: 9 }}>
            <Button
              icon={<ShareAltOutlined />}
              onClick={() =>
                navigate({
                  pathname: '/token/share',
                  search: `?email=${record.email}`,
                })
              }
            >
              {t('token.shareList')}
            </Button>
          </Badge>
          <Button icon={<PlusOutlined />} onClick={() => onShareAdd(record)} />
          <Button icon={<FundOutlined />} onClick={() => onShareInfo(record)} />
        </Button.Group>
      ),
    },
    {
      title: t('token.action'),
      key: 'operation',
      align: 'center',
      render: (_, record) => (
        <Button.Group>
          <Popconfirm
            title={t('common.refreshConfirm')}
            okText="Yes"
            cancelText="No"
            placement="left"
            onConfirm={() => {
              setRefreshAccountId(record.id);
              refreshAccountMutation.mutate(record.id, {
                onSettled: () => setRefreshAccountId(undefined),
              });
            }}
          >
            <Button
              key={record.id}
              icon={<ReloadOutlined />}
              type="primary"
              loading={refreshAccountId === record.id}
            >
              {t('common.refresh')}
            </Button>
          </Popconfirm>
          <Button onClick={() => onEdit(record)} icon={<EditOutlined />} type="primary" />
          <Popconfirm
            title={t('common.deleteConfirm')}
            okText="Yes"
            cancelText="No"
            placement="left"
            onConfirm={() => {
              setDeleteAccountId(record.id);
              deleteAccountMutation.mutate(record.id, {
                onSuccess: () => setDeleteAccountId(undefined),
              });
            }}
          >
            <Button
              icon={<DeleteOutlined />}
              type="primary"
              loading={deleteAccountId === record.id}
              danger
            />
          </Popconfirm>
        </Button.Group>
      ),
    },
  ];

  const { data } = useQuery({
    queryKey: ['accounts', searchEmail],
    queryFn: () => accountService.searchAccountList(searchEmail),
  });

  const onSearchFormReset = () => {
    searchForm.resetFields();
  };

  const onCreate = () => {
    setAccountModalProps((prev) => ({
      ...prev,
      show: true,
      title: t('token.createNew'),
      formValue: {
        id: undefined,
        email: '',
        password: '',
        shared: 0,
        custom_type: 'refresh_token',
        custom_token: '',
      },
    }));
  };

  const onShareAdd = (record: Account) => {
    setShareModalProps((prev) => ({
      ...prev,
      show: true,
      title: t('token.share'),
      formValue: {
        ...defaultShare,
        accountId: record.id,
      },
    }));
  };

  const onShareInfo = (record: Account) => {
    setShareInfoModalProps((prev) => ({
      ...prev,
      show: true,
      accountId: record.id,
    }));
  };

  const onEdit = (record: Account) => {
    setAccountModalProps((prev) => ({
      ...prev,
      show: true,
      title: t('token.edit'),
      formValue: {
        ...prev.formValue,
        id: record.id,
        email: record.email,
        password: record.password,
        shared: record.shared,
        refreshToken: record.refreshToken,
        accessToken: record.accessToken,
      },
    }));
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm}>
          <Row gutter={[16, 16]}>
            <Col span={6} lg={6}>
              <Form.Item<SearchFormFieldType>
                label={t('token.email')}
                name="email"
                className="!mb-0"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={18} lg={18}>
              <div className="flex justify-end">
                <Button onClick={onSearchFormReset}>{t('token.reset')}</Button>
                <Button type="primary" className="ml-4">
                  {t('token.search')}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title={t('token.accountList')}
        extra={
          <Space>
            <Button type="primary" onClick={onCreate}>
              {t('token.createNew')}
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10 }}
          columns={columns}
          dataSource={data}
        />
      </Card>
      <AccountModal {...AccountModalPros} />
      <ShareModal {...shareModalProps} />
      <ShareInfoModal {...shareInfoModalProps} />
    </Space>
  );
}

export type ShareModalProps = {
  formValue: Share;
  title: string;
  show: boolean;
  onOk: (values: Share, callback: any) => void;
  onCancel: VoidFunction;
};

export function ShareModal({ title, show, formValue, onOk, onCancel }: ShareModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const mode = title === 'Edit' || title === '编辑' ? 'edit' : 'create';

  useEffect(() => {
    form.setFieldsValue({ ...formValue });
  }, [formValue, form]);

  const onModalOk = () => {
    form.validateFields().then((values) => {
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
      <Form initialValues={formValue} form={form} layout="vertical" preserve={false}>
        <Form.Item<Share> name="id" hidden>
          <Input />
        </Form.Item>
        <Form.Item<Share> name="shareToken" hidden>
          <Input />
        </Form.Item>
        <Form.Item<Share> name="accountId" hidden>
          <Input />
        </Form.Item>
        <Form.Item<Share> label="Unique Name" name="uniqueName" required>
          <Input readOnly={mode === 'edit'} disabled={mode === 'edit'} />
        </Form.Item>
        <Form.Item<Share> label={t('token.password')} name="password" required>
          <Input.Password />
        </Form.Item>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item<Share> label={t('token.expiresIn')} name="expiresIn">
              <InputNumber formatter={(value) => (value == 0 ? '默认' : `${value} 秒`)} />
            </Form.Item>
          </Col>
          <Col span={18}>
            <Form.Item<Share> label={t('token.siteLimit')} name="siteLimit">
              <Input placeholder="eg: https://demo.oaifree.com" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<Share> label={t('token.gpt35Limit')} name="gpt35Limit">
              <InputNumber<number>
                style={{ width: '100%' }}
                formatter={(value) => {
                  switch (value?.toString()) {
                    case '-1':
                      return '无限制';
                    case '0':
                      return '禁用';
                    default:
                      return `${value}`;
                  }
                }}
                parser={(value) => {
                  switch (value) {
                    case '无限制':
                      return -1;
                    case '禁用':
                      return 0;
                    default:
                      return parseInt(value!);
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<Share>
              label={
                <LabelWithInfo
                  label={t('token.gpt4Limit')}
                  info="这里的限制只是在FK限制，而不是OpenAi的限额"
                />
              }
              name="gpt4Limit"
            >
              <InputNumber<number>
                style={{ width: '100%' }}
                formatter={(value) => {
                  switch (value?.toString()) {
                    case '-1':
                      return '无限制';
                    case '0':
                      return '禁用';
                    default:
                      return `${value}`;
                  }
                }}
                parser={(value) => {
                  switch (value) {
                    case '无限制':
                      return -1;
                    case '禁用':
                      return 0;
                    default:
                      return parseInt(value!);
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item<Share>
              label={
                <LabelWithInfo label={t('token.refreshEveryday')} info="刷新次数限制的频率，" />
              }
              name="refreshEveryday"
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<Share>
              label={t('token.showUserinfo')}
              name="showUserinfo"
              labelCol={{ span: 18 }}
              wrapperCol={{ span: 6 }}
              valuePropName="checked"
            >
              <Checkbox defaultChecked={false} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<Share>
              label={t('token.showConversations')}
              name="showConversations"
              valuePropName="checked"
            >
              <Checkbox defaultChecked />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item<Share> label={t('token.comment')} name="comment">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
}

type AccountModalProps = {
  formValue: AccountAddReq;
  title: string;
  show: boolean;
  onOk: (values: AccountAddReq, setLoading: any) => void;
  onCancel: VoidFunction;
};

function AccountModal({ title, show, formValue, onOk, onCancel }: AccountModalProps) {
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
          label={`Refresh Token(${t('common.optional')})`}
          name="refreshToken"
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item<AccountAddReq>
          label={`Access Token(${t('common.optional')})`}
          name="accessToken"
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
}

type ShareInfoModalProps = {
  accountId: number;
  onOk: VoidFunction;
  show: boolean;
};

function ShareInfoModal({ accountId, onOk, show }: ShareInfoModalProps) {
  const { data: statistic, isLoading } = useQuery({
    queryKey: ['shareInfo', accountId],
    queryFn: () => shareService.getShareStatistic(accountId),
    enabled: show,
  });

  const { t } = useTranslation();

  const chartOptions = useChart({
    legend: {
      horizontalAlign: 'center',
    },
    stroke: {
      show: true,
    },
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: false,
      },
    },
    xaxis: {
      categories: statistic?.categories || [],
    },
    tooltip: {
      fillSeriesColor: false,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
  });

  return (
    <Modal title={t('token.statistic')} open={show} onOk={onOk} closable={false} onCancel={onOk}>
      <Spin spinning={isLoading} tip={t('token.queryingInfo')}>
        <Chart type="bar" series={statistic?.series || []} options={chartOptions} height={320} />
      </Spin>
    </Modal>
  );
}
