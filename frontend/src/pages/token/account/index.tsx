import {
  Badge,
  Button,
  Card,
  Col, Collapse,
  Form,
  Input,
  Modal,
  Popconfirm, Radio,
  Row,
  Space, Switch,
} from 'antd';
import Table, {ColumnsType} from 'antd/es/table';
import {useEffect, useState} from 'react';

import ProTag from '@/theme/antd/components/tag';

import {Account, Share} from '#/entity';
import {
  CheckCircleTwoTone, DeleteOutlined,
  EditOutlined,
  ExclamationCircleTwoTone, PlusOutlined,
  ReloadOutlined, ShareAltOutlined
} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import accountService, {
  AccountAddReq,
} from "@/api/services/accountService.ts";
import Password from "antd/es/input/Password";
import {t} from "@/locales/i18n.ts";
import {useNavigate} from "react-router-dom";
import {useAddShareMutation} from "@/store/shareStore.ts";
import {
  useAddAccountMutation,
  useDeleteAccountMutation, useRefreshAccountMutation,
  useUpdateAccountMutation
} from "@/store/accountStore.ts";

type SearchFormFieldType = Pick<Account, 'email'>;

export default function AccountPage() {
  const [searchForm] = Form.useForm();

  const addAccountMutation = useAddAccountMutation();
  const updateAccountMutation = useUpdateAccountMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const refreshAccountMutation = useRefreshAccountMutation();
  const addShareMutation = useAddShareMutation();

  const navigate = useNavigate();

  const [deleteAccountId, setDeleteAccountId] = useState<number | undefined>(-1);
  const [refreshAccountId, setRefreshAccountId] = useState<number | undefined>(-1);

  const [AccountModalPros, setAccountModalProps] = useState<AccountModalProps>({
    formValue: {
      email: '',
      password: '',
      custom_type: 'session_token',
      custom_token: '',
    },
    title: 'New',
    show: false,
    onOk: (values: AccountAddReq, callback) => {
      if (values.id) {
        updateAccountMutation.mutate(values, {
          onSuccess: () => {
            setAccountModalProps((prev) => ({...prev, show: false}))
          },
          onSettled: () => callback(false)
        });
      } else {
        addAccountMutation.mutate(values, {
          onSuccess: () => {
            setAccountModalProps((prev) => ({...prev, show: false}))
          },
          onSettled: () => callback(false)
        });
      }
    },
    onCancel: () => {
      setAccountModalProps((prev) => ({...prev, show: false}));
    },
  });

  const [shareModalProps, setShareModalProps] = useState<ShareModalProps>({
    formValue: {
      accountId: -1,
      uniqueName: '',
      password: '',
      comment: '',
    },
    title: 'New',
    show: false,
    onOk: (values: Share, callback) => {
      callback(true);
      addShareMutation.mutate(values, {
        onSuccess: () => {
          setShareModalProps((prev) => ({...prev, show: false}))
        },
        onSettled: () => callback(false)
      });
    },
    onCancel: () => {
      setShareModalProps((prev) => ({...prev, show: false}));
    },
  });

  const columns: ColumnsType<Account> = [
    {title: 'Email', dataIndex: 'email', width: 120},
    {title: 'Password', dataIndex: 'password', align: 'center', width: 120},
    {
      title: 'Token',
      dataIndex: 'token',
      align: 'center',
      width: 80,
      render: (_, record) => (
        // 当Refresh Token存在时，显示Refresh Token，否则显示Session Token，如果两者都不存在，则显示Error Tag
        record.refreshToken ? (
          <ProTag color="cyan">Refresh Token</ProTag>
        ) : record.sessionToken ? (
          <ProTag color="blue">Session Token</ProTag>
        ) : (
          <ProTag color="error">Empty</ProTag>
        )
      ),
    },
    {
      title: 'Login Status',
      dataIndex: 'accessToken',
      align: 'center',
      width: 150,
      render: (_, record) => (
        // 当accessToken存在时，显示accessToken，否则显示Error Tag
        record.accessToken ? (
          <CheckCircleTwoTone twoToneColor={'#52c41a'}/>
        ) : (
          <ExclamationCircleTwoTone twoToneColor={'#fa8c16'}/>
        )
      ),
    },
    {
      title: 'Share Status',
      dataIndex: 'shared',
      align: 'center',
      width: 150,
      render: (_, record) => (
        // 当accessToken存在时，显示accessToken，否则显示Error Tag
        record.shared == 1 ? (
          <CheckCircleTwoTone twoToneColor={'#52c41a'}/>
        ) : (
          <ExclamationCircleTwoTone twoToneColor={'#fa8c16'}/>
        )
      ),
    },
    {
      title: 'Update Time',
      dataIndex: 'updateTime',
      align: 'center',
      width: 150,
    },
    {
      title: 'Share',
      key: 'share',
      align: 'center',
      width: 180,
      render: (_, record) => (
        <Button.Group>
          <Badge count={record.shareList?.length} style={{zIndex: 9}}>
            <Button icon={<ShareAltOutlined />} onClick={() => navigate({
              pathname: '/token/share',
              search: `?email=${record.email}`,
            })}>
              分享管理
            </Button>
          </Badge>
          <Button icon={<PlusOutlined />} onClick={() => onShareAdd(record)}/>
        </Button.Group>
      ),
    },
    {
      title: 'Action',
      key: 'operation',
      align: 'center',
      render: (_, record) => (
        <Button.Group>
          <Popconfirm title={t('common.refreshConfirm')} okText="Yes" cancelText="No" placement="left" onConfirm={() => {
            setRefreshAccountId(record.id);
            refreshAccountMutation.mutate(record.id, {
              onSuccess: () => setRefreshAccountId(undefined)
            })
          }}>
            <Button key={record.id} icon={<ReloadOutlined/>} type={"primary"} loading={refreshAccountId === record.id}>
              {t('common.refresh')}
            </Button>
          </Popconfirm>
          <Button onClick={() => onEdit(record)} icon={<EditOutlined/>} type={"primary"}/>
          <Popconfirm title={t('common.deleteConfirm')} okText="Yes" cancelText="No" placement="left" onConfirm={() => {
            setDeleteAccountId(record.id);
            deleteAccountMutation.mutate(record.id,{
              onSuccess: () => setDeleteAccountId(undefined)
            })
          }}>
            <Button icon={<DeleteOutlined/>} type={"primary"} loading={deleteAccountId === record.id} danger/>
          </Popconfirm>
        </Button.Group>
      ),
    },
  ];

  const {data} = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAccountList,
  })

  const onSearchFormReset = () => {
    searchForm.resetFields();
  };

  const onCreate = () => {
    setAccountModalProps((prev) => ({
      ...prev,
      show: true,
      title: 'Create New',
      formValue: {
        id: undefined,
        email: '',
        password: '',
        shared: 0,
        custom_type: 'session_token',
        custom_token: '',
      },
    }));
  };

  const onShareAdd = (record: Account) => {
    setShareModalProps((prev) => ({
      ...prev,
      show: true,
      title: 'Share',
      formValue: {
        accountId: record.id,
        uniqueName: '',
        password: '',
        comment: '',
      },
    }));
  }

  const onEdit = (record: Account) => {
    const tokenType = record.refreshToken ? 'refresh_token' : 'session_token';
    const token = record.sessionToken || record.refreshToken || '';

    setAccountModalProps((prev) => ({
      ...prev,
      show: true,
      title: 'Edit',
      formValue: {
        ...prev.formValue,
        id: record.id,
        email: record.email,
        password: record.password,
        shared: record.shared,
        custom_type: tokenType,
        custom_token: token,
      }
    }));
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm}>
          <Row gutter={[16, 16]}>
            <Col span={6} lg={6}>
              <Form.Item<SearchFormFieldType> label="Email" name="email" className="!mb-0">
                <Input/>
              </Form.Item>
            </Col>
            <Col span={6} lg={18}>
              <div className="flex justify-end">
                <Button onClick={onSearchFormReset}>Reset</Button>
                <Button type="primary" className="ml-4">
                  Search
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title="Account List"
        extra={
          <Button type="primary" onClick={onCreate}>
            New
          </Button>
        }
      >
        <Table
          rowKey="id"
          size="small"
          scroll={{x: 'max-content'}}
          pagination={false}
          columns={columns}
          dataSource={data}
        />
      </Card>

      <AccountModal {...AccountModalPros} />
      <ShareModal {...shareModalProps} />
    </Space>
  );
}

export type ShareModalProps = {
  formValue: Share;
  title: string;
  show: boolean;
  onOk: (values: Share, callback: any) => void;
  onCancel: VoidFunction;
}

export const ShareModal = ({title, show, formValue, onOk, onCancel}: ShareModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue({...formValue});
  }, [formValue, form]);

  const onModalOk = () => {
    form.validateFields().then((values) => {
      onOk(values, setLoading);
    });
  }

  return (
    <Modal title={title} open={show} onOk={onModalOk} onCancel={() => {
      console.log('onCancel')
      form.resetFields();
      onCancel();
    }} okButtonProps={{
      loading: loading,
    }} destroyOnClose={false}>
      <Form
        initialValues={formValue}
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Form.Item<Share> name="accountId" hidden>
          <Input/>
        </Form.Item>
        <Form.Item<Share> label="UniqueName" name="uniqueName"  required>
          <Input readOnly={title === 'Edit'} disabled={title === 'Edit'} />
        </Form.Item>
        <Form.Item<Share> label="Password" name="password" required>
          <Input.Password />
        </Form.Item>
        <Form.Item<Share> label="Comment" name="comment" >
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
  onOk: (values: AccountAddReq,setLoading: any) => void;
  onCancel: VoidFunction;
};

function AccountModal({title, show, formValue, onOk, onCancel}: AccountModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue({...formValue});
  }, [formValue, form]);

  const onModalOk = () => {
    form.validateFields().then((values) => {
      onOk(values, setLoading);
    });
  }

  const CustomTokenItem = () =>
    <div>
      <Form.Item<AccountAddReq> label="Token Type" name="custom_type" required>
        <Radio.Group>
          <Radio value="session_token">Session Token</Radio>
          <Radio value="refresh_token">Refresh Token</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item<AccountAddReq> label="Token" name="custom_token">
        <Input.TextArea/>
      </Form.Item>
    </div>

  return (
    <Modal title={title} open={show} onOk={onModalOk} onCancel={() => {
      console.log('onCancel')
      form.resetFields();
      onCancel();
    }} okButtonProps={{
      loading: loading,
    }} destroyOnClose={false}>
      <Form
        initialValues={formValue}
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Form.Item<AccountAddReq> name="id" hidden>
          <Input/>
        </Form.Item>
        <Form.Item<AccountAddReq> label="Email" name="email" required>
          <Input/>
        </Form.Item>
        <Form.Item<AccountAddReq> label="Password" name="password" required>
          <Password/>
        </Form.Item>
        <Form.Item<AccountAddReq> label="Shared" name="shared" labelAlign={'left'}
                                  valuePropName="checked" getValueFromEvent={
          (v) => {
            return v ? 1 : 0;
          }
        } required>
          <Switch/>
        </Form.Item>
        <Collapse items={[{key: '1', label: '自定义Token', children: <CustomTokenItem/>}]}/>
      </Form>
    </Modal>
  );
}
