import {
  CheckCircleTwoTone,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleTwoTone,
  PlusOutlined,
  ReloadOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  Popconfirm,
  Row,
  Space,
  Typography,
} from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import accountService, { AccountAddReq } from '@/api/services/accountService.ts';
import {
  useAddAccountMutation,
  useDeleteAccountMutation,
  useRefreshAccountMutation,
  useUpdateAccountMutation,
} from '@/store/accountStore.ts';
import ProTag from '@/theme/antd/components/tag';
import { onCopy } from '@/utils/copy.ts';

import { useAddShareMutation } from '@/store/shareStore.ts';

import {ClaudeAccount, defaultShare, ProductType, Share} from '#/entity';
import {ShareModal, ShareModalProps} from "@/pages/token/account/components/ShareModal.tsx";
import {AccountModal, AccountModalProps} from "@/pages/token/account/components/AccountModal.tsx";

type SearchFormFieldType = Pick<ClaudeAccount, 'email'>;

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

  const defaultAccountFormProps = {
    id: undefined,
    email: '',
    accountType: 'claude' as ProductType,
    password: '',
    refreshToken: '',
    accessToken: '',
    sessionKey: '',
    shared: 0,
  }

  const [AccountModalPros, setAccountModalProps] = useState<AccountModalProps>({
    formValue: {
      id: undefined,
      sessionKey: '',
      email: '',
      accountType: 'claude',
      password: '',
      refreshToken: '',
    },
    title: 'New',
    show: false,
    onOk: (values: AccountAddReq, callback) => {
      if (values.id) {
        updateAccountMutation.mutate(values, {
          onSuccess: () => {
            setAccountModalProps((prev) => ({ ...prev, show: false, formValue: {...defaultAccountFormProps} }));
          },
          onSettled: () => callback(false),
        });
      } else {
        addAccountMutation.mutate(values, {
          onSuccess: () => {
            setAccountModalProps((prev) => ({ ...prev, show: false, formValue: {...defaultAccountFormProps} }));
          },
          onSettled: () => callback(false),
        });
      }
    },
    onCancel: () => {
      setAccountModalProps((prev) => ({ ...prev, show: false, formValue: {...defaultAccountFormProps} }));
    },
  });

  const [shareModalProps, setShareModalProps] = useState<ShareModalProps>({
    formValue: { ...defaultShare, shareType: 'claude' },
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

  const columns: ColumnsType<ClaudeAccount> = [
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
      title: 'Session Key',
      dataIndex: 'sessionKey',
      align: 'center',
      width: 150,
      render: (_, record) =>
        // 当refreshToken存在时，显示refreshToken，并点击复制，否则显示Emtpy Tag
        record.sessionKey ? (
          <Input
            value={record.sessionKey}
            onClick={(e) => onCopy(record.sessionKey!, t, e)}
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
                  pathname: '/admin/share/claude',
                  search: `?email=${record.email}`,
                })
              }
            >
              {t('token.shareList')}
            </Button>
          </Badge>
          <Button icon={<PlusOutlined />} onClick={() => onShareAdd(record)} />
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
    queryKey: ['accounts', 'claude', searchEmail],
    queryFn: () => accountService.searchAccountList(searchEmail, "claude"),
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
        sessionKey: '',
        accountType: 'claude',
        shared: 0,
        custom_type: 'refresh_token',
        custom_token: '',
      },
    }));
  };

  const onShareAdd = (record: ClaudeAccount) => {
    setShareModalProps((prev) => ({
      ...prev,
      show: true,
      title: t('token.share'),
      formValue: {
        ...defaultShare,
        accountId: record.id,
        shareType: 'claude'
      },
    }));
  };

  const onEdit = (record: ClaudeAccount) => {
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
        sessionKey: record.sessionKey,
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
    </Space>
  );
}


