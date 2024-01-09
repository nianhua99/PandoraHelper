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
import { useEffect } from 'react';

import {Share} from '#/entity';
import {
  DeleteOutlined, EditOutlined,
} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import {useSearchParams} from "@/router/hooks";
import shareService from "@/api/services/shareService.ts";

type SearchFormFieldType = {
  email?: string;
  uniqueName?: string;
};

export default function SharePage() {
  const params = useSearchParams();
  const [searchForm] = Form.useForm();
  const email = Form.useWatch('email', searchForm);
  const uniqueName = Form.useWatch('uniqueName', searchForm);

  useEffect(() => {
    searchForm.setFieldValue('email', params.get('email'))
  }, [params]);

  const columns: ColumnsType<Share> = [
    { title: 'Account Id', dataIndex: 'accountId', width: 120,  },
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
      render: () => (
        <Button.Group>
          <Button icon={<EditOutlined />} type={"primary"}/>
          <Popconfirm title="Delete the Account" okText="Yes" cancelText="No" placement="left">
            <Button icon={<DeleteOutlined />} type={"primary"}  danger/>
          </Popconfirm>
        </Button.Group>
      ),
    },
  ];

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
          rowKey="id"
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={false}
          columns={columns}
          dataSource={data}
        />
      </Card>
    </Space>
  );
}
