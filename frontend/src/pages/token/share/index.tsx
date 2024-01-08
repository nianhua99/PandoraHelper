// import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Space,
} from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import { useEffect, useState } from 'react';

import ProTag from '@/theme/antd/components/tag';

import { Account } from '#/entity';
import {
  CheckCircleTwoTone, DeleteOutlined,
  EditOutlined,
  ExclamationCircleTwoTone,
  ReloadOutlined
} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import accountService from "@/api/services/accountService.ts";
import {useSearchParams} from "@/router/hooks";

type SearchFormFieldType = Pick<Account, 'email'>;

export default function AccountPage() {
  const [searchForm] = Form.useForm();
  const searchParams = useSearchParams()

  useEffect(() => {
    searchParams.forEach((value, key) => {
      console.log(key, value)
    })
  }, [searchParams]);


  const [AccountModalPros, setAccountModalProps] = useState<AccountModalProps>({
    formValue: {
      email: '',
      password: '',
      id: 0
    },
    title: 'New',
    show: false,
    onOk: () => {
      setAccountModalProps((prev) => ({ ...prev, show: false }));
    },
    onCancel: () => {
      setAccountModalProps((prev) => ({ ...prev, show: false }));
    },
  });

  const columns: ColumnsType<Account> = [
    { title: 'Email', dataIndex: 'email', width: 120 },
    { title: 'Password', dataIndex: 'password', align: 'center', width: 120 },
    {
      title: 'Token',
      dataIndex: 'token',
      align: 'center',
      width: 80,
      render: (_,record) => (
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
      render: (_,record) => (
        // 当accessToken存在时，显示accessToken，否则显示Error Tag
        record.accessToken ? (
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
      title: 'Action',
      key: 'operation',
      align: 'center',
      render: (_, record) => (
        <Button.Group>
          <Popconfirm title="Delete the Account" okText="Yes" cancelText="No" placement="left">
            {/*<IconButton>*/}
            {/*  <ReloadOutlined />刷新*/}
            {/*</IconButton>*/}
            <Button icon={<ReloadOutlined />} type={"primary"}>
              刷新
            </Button>
          </Popconfirm>
          <Button onClick={() => onEdit(record)} icon={<EditOutlined />} type={"primary"} />
          <Popconfirm title="Delete the Account" okText="Yes" cancelText="No" placement="left">
            <Button icon={<DeleteOutlined />} type={"primary"}  danger/>
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

  // const { data } = useQuery({
  //   queryKey: ['orgs'],
  //   queryFn: orgService.getOrgList,
  // });

  const { data } = useQuery({
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
        ...prev.formValue,
      },
    }));
  };

  const onEdit = (formValue: Account) => {
    setAccountModalProps((prev) => ({
      ...prev,
      show: true,
      title: 'Edit',
      formValue,
    }));
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm}>
          <Row gutter={[16, 16]}>
            <Col span={6} lg={6}>
              <Form.Item<SearchFormFieldType> label="Email" name="email" className="!mb-0">
                <Input />
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
          scroll={{ x: 'max-content' }}
          pagination={false}
          columns={columns}
          dataSource={data}
          rowSelection={{ ...rowSelection }}
        />
      </Card>

      <AccountModal {...AccountModalPros} />
    </Space>
  );
}

type AccountModalProps = {
  formValue: Account;
  title: string;
  show: boolean;
  onOk: VoidFunction;
  onCancel: VoidFunction;
};

function AccountModal({ title, show, formValue, onOk, onCancel }: AccountModalProps) {
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({ ...formValue });
  }, [formValue, form]);
  return (
    <Modal title={title} open={show} onOk={onOk} onCancel={onCancel}>
      <Form
        initialValues={formValue}
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
      >
        <Form.Item<Account> label="Email" name="email" required>
          <Input />
        </Form.Item>
        <Form.Item<Account> label="Password" name="password" required>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
