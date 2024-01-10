// import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Popconfirm,
  Row,
  Space,
} from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import {useEffect, useState} from 'react';

import {Share} from '#/entity';
import {
  DeleteOutlined, EditOutlined,
} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import {useSearchParams} from "@/router/hooks";
import shareService from "@/api/services/shareService.ts";
import {useDeleteShareMutation, useUpdateShareMutation} from "@/store/shareStore.ts";
import {ShareModal, ShareModalProps} from "@/pages/token/account";
type SearchFormFieldType = {
  email?: string;
  uniqueName?: string;
};

export default function SharePage() {

  const deleteShareMutation = useDeleteShareMutation()
  const updateShareMutation = useUpdateShareMutation()

  const params = useSearchParams();
  const [searchForm] = Form.useForm();
  const email = Form.useWatch('email', searchForm);
  const uniqueName = Form.useWatch('uniqueName', searchForm);
  const [deleteRowKey, setDeleteRowKey] = useState<string | undefined>(undefined);
  const [shareModalProps, setShareModalProps] = useState<ShareModalProps>({
    formValue: {
      accountId: -1,
      uniqueName: '',
      password: '',
      comment: '',
    },
    title: 'Edit',
    show: false,
    onOk: (values: Share) => {
      console.log(values)
      setShareModalProps((prev) => ({...prev, show: false}));
    },
    onCancel: () => {
      setShareModalProps((prev) => ({...prev, show: false}));
    },
  });


  useEffect(() => {
    searchForm.setFieldValue('email', params.get('email'))
  }, [params]);

  const columns: ColumnsType<Share> = [
    // { title: 'Account Id', dataIndex: 'accountId', width: 120,  },
    { title: 'Email', dataIndex: 'email', width: 120 },
    { title: 'UniqueName', dataIndex: 'uniqueName', align: 'center', width: 120 },
    { title: 'Password', dataIndex: 'password', align: 'center', width: 120 },
    { title: 'ShareToken', dataIndex: 'shareToken', align: 'center', width: 300,
      render: (text) => (
        <Input value={text} readOnly/>
      ),
    },
    { title: 'Comment', dataIndex: 'comment', align: 'center', width: 300 },
    {
      title: 'Action',
      key: 'operation',
      align: 'center',
      render: (_,record) => (
        <Button.Group>
          <Button icon={<EditOutlined />} type={"primary"} onClick={() => onEdit(record)}/>
          <Popconfirm title="Delete the Share" okText="Yes" cancelText="No" placement="left" onConfirm={() => handleDelete(record)}>
            <Button icon={<DeleteOutlined />} type={"primary"} loading={deleteRowKey == record.accountId + record.uniqueName}  danger/>
          </Popconfirm>
        </Button.Group>
      ),
    },
  ];

  const onEdit = (record: Share) => {
    setShareModalProps({
      formValue: record,
      title: 'Edit',
      show: true,
      onOk: (values: Share, callback) => {
        updateShareMutation.mutate(values, {
          onSuccess: () => {
            setShareModalProps((prev) => ({...prev, show: false}));
          },
          onSettled: () => callback(false)
        })
      },
      onCancel: () => {
        setShareModalProps((prev) => ({...prev, show: false}));
      },
    })
  }

  const handleDelete = (record: Share) => {
    setDeleteRowKey(record.accountId + record.uniqueName)
    deleteShareMutation.mutate(record, {
      onSettled: () => {
        setDeleteRowKey(undefined)
      }
    })
  }

  const { data } = useQuery({
    queryKey: ['shareList', email, uniqueName],
    queryFn: () => {
      return shareService.searchShare(email, uniqueName)
    }
  })

  const onSearchFormReset = () => {
    searchForm.resetFields();
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm} >
          <Row gutter={[16, 16]}>
            <Col span={6} lg={6}>
              <Form.Item<SearchFormFieldType> label="Email" name="email" className="!mb-0">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6} lg={6}>
              <Form.Item<SearchFormFieldType> label="UniqueName" name="uniqueName" className="!mb-0">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6} lg={12}>
              <div className="flex justify-end">
                <Button onClick={onSearchFormReset}>Reset</Button>
                <Button type="primary" className="ml-4" onClick={() => {
                  searchForm.validateFields().then((values) => {
                    console.log(values)
                    searchForm.submit()
                  })
                }}>
                  Search
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title="Share List"
      >
        <Table
          rowKey={record => record.accountId + record.uniqueName}
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={false}
          columns={columns}
          dataSource={data}
        />
      </Card>
      <ShareModal {...shareModalProps}/>
    </Space>
  );
}
