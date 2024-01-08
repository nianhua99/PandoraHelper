import {
  App,
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
import {TableRowSelection} from 'antd/es/table/interface';
import {useEffect, useState} from 'react';

import ProTag from '@/theme/antd/components/tag';

import {Account} from '#/entity';
import {
  CarOutlined,
  CheckCircleTwoTone, DeleteOutlined,
  EditOutlined,
  ExclamationCircleTwoTone,
  ReloadOutlined
} from "@ant-design/icons";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import accountService, {
  AccountAddReq,
} from "@/api/services/accountService.ts";
import Password from "antd/es/input/Password";

type SearchFormFieldType = Pick<Account, 'email'>;

export default function AccountPage() {
  const [searchForm] = Form.useForm();
  const {message} = App.useApp();
  const client = useQueryClient()
  const [AccountModalPros, setAccountModalProps] = useState<AccountModalProps>({
    formValue: {
      email: '',
      password: '',
      custom_type: 'session_token',
      custom_token: '',
    },
    title: 'New',
    show: false,
    onOk: (values: AccountAddReq) => {
      if (values.id) {
        updateAccountMutation.mutate(values);
      } else {
        addAccountMutation.mutate(values);
      }
      setAccountModalProps((prev) => ({...prev, show: false}));
    },
    onCancel: () => {
      setAccountModalProps((prev) => ({...prev, show: false}));
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
        <Badge count={record.shareList?.length}>
          <Button icon={<CarOutlined/>}>
            查看乘客
          </Button>
        </Badge>
      ),
    },
    {
      title: 'Action',
      key: 'operation',
      align: 'center',
      render: (_, record) => (
        <Button.Group>
          <Popconfirm title="Delete the Account" okText="Yes" cancelText="No" placement="left">
            {/*<IconButton>*/}
            {/*  <ReloadOutlined />刷新*/}
            {/*</IconButton>*/}
            <Button icon={<ReloadOutlined/>} type={"primary"}>
              刷新
            </Button>
          </Popconfirm>
          <Button onClick={() => onEdit(record)} icon={<EditOutlined/>} type={"primary"}/>
          <Popconfirm title="Delete the Account" okText="Yes" cancelText="No" placement="left" onConfirm={() => deleteAccountMutation.mutate(record.id)}>
            <Button icon={<DeleteOutlined/>} type={"primary"} danger/>
          </Popconfirm>
        </Button.Group>
      ),
    },
  ];

  // rowSelection objects indicates the need for row selection
  const rowSelection: TableRowSelection<Account> = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    onSelect: (record, selected, selectedRows) => {
      console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      console.log(selected, selectedRows, changeRows);
    },
  };

  const {data} = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAccountList,
  })

  const addAccountMutation =
    useMutation(accountService.addAccount, {
      onSuccess: () => {
        /* onSuccess */
        message.success('Add Account Success')
        client.invalidateQueries(['accounts']);
      },
    });

  const updateAccountMutation =
    useMutation(accountService.updateAccount, {
      onSuccess: () => {
        /* onSuccess */
        message.success('Update Account Success')
        client.invalidateQueries(['accounts']);
      },
    });

  const deleteAccountMutation =
    useMutation(accountService.deleteAccount, {
      onSuccess: () => {
        /* onSuccess */
        message.success('Delete Account Success')
        client.invalidateQueries(['accounts']);
      },
    });

  const refreshAccountMutation =
    useMutation(accountService.refreshAccount, {
      onSuccess: () => {
        /* onSuccess */
        message.success('Delete Account Success')
        client.invalidateQueries(['accounts']);
      },
    });

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
          rowSelection={{...rowSelection}}
        />
      </Card>

      <AccountModal {...AccountModalPros} />
    </Space>
  );
}

type AccountModalProps = {
  formValue: AccountAddReq;
  title: string;
  show: boolean;
  onOk: (values: AccountAddReq) => void;
  onCancel: VoidFunction;
};

function AccountModal({title, show, formValue, onOk, onCancel}: AccountModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({...formValue});
  }, [formValue, form]);

  const onModalOk = () => {
    form.validateFields().then((values) => {
      onOk(values);
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
