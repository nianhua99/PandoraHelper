// import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Popconfirm,
  Row,
  Space, Typography,
} from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import {useEffect, useState} from 'react';

import {defaultShare, Share} from '#/entity';
import {
  DeleteOutlined, EditOutlined,
} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import {useSearchParams} from "@/router/hooks";
import shareService from "@/api/services/shareService.ts";
import {useDeleteShareMutation, useUpdateShareMutation} from "@/store/shareStore.ts";
import {ShareModal, ShareModalProps} from "@/pages/token/account";
import {useTranslation} from "react-i18next";
import {onCopy} from "@/utils/copy.ts";
type SearchFormFieldType = {
  email?: string;
  uniqueName?: string;
};

export default function SharePage() {

  const deleteShareMutation = useDeleteShareMutation()
  const updateShareMutation = useUpdateShareMutation()

  const {t} = useTranslation()

  const params = useSearchParams();
  const [searchForm] = Form.useForm();
  const email = Form.useWatch('email', searchForm);
  const uniqueName = Form.useWatch('uniqueName', searchForm);
  const [deleteRowKey, setDeleteRowKey] = useState<string | undefined>(undefined);
  const [shareModalProps, setShareModalProps] = useState<ShareModalProps>({
    formValue: {...defaultShare,},
    title: t('token.edit'),
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
    {title: t('token.email'), dataIndex: ['account','email'],
      render: (text) => (
          <Typography.Text style={{maxWidth: 200}} ellipsis={true}>
            {text}
          </Typography.Text>
        )
    },
    { title: 'Unique Name', dataIndex: 'uniqueName', align: 'center', width: 120 },
    { title: t('token.password'), dataIndex: 'password', align: 'center', width: 120 },
    { title: t('token.gpt35Limit'), dataIndex: 'gpt35Limit', align: 'center', width: 120,
      render: text => text == -1 ? '无限制' : text
    },
    { title: t('token.gpt4Limit'), dataIndex: 'gpt4Limit', align: 'center', width: 120,
      render: text => text == -1 ? '无限制' : text
    },
    { title: t('token.refreshEveryday'), dataIndex: 'refreshEveryday', align: 'center', width: 120,
      render: text => text ? '是' : '否'
    },
    { title: t('token.expiresIn'), dataIndex: 'expiresIn', align: 'center', width: 120,
      render: text => text == 0 ? '最大' : text
    },
    { title: 'Share Token', dataIndex: 'shareToken', align: 'center',
      render: (text) => (
        <Input value={text} onClick={(e) => onCopy(text, t, e)} readOnly/>
      ),
    },
    { title: t('token.comment'), dataIndex: 'comment', align: 'center',
      render: (text) => (
        <Typography.Text style={{maxWidth: 500}} ellipsis={true}>
          {text}
        </Typography.Text>
      )
    },
    {
      title: t('token.action'),
      key: 'operation',
      align: 'center',
      render: (_,record) => (
        <Button.Group>
          <Button icon={<EditOutlined />} type={"primary"} onClick={() => onEdit(record)}/>
          <Popconfirm title={t('token.deleteConfirm')} okText="Yes" cancelText="No" placement="left" onConfirm={() => handleDelete(record)}>
            <Button icon={<DeleteOutlined />} type={"primary"} loading={deleteRowKey == record.accountId + record.uniqueName}  danger/>
          </Popconfirm>
        </Button.Group>
      ),
    },
  ];

  const onEdit = (record: Share) => {
    setShareModalProps({
      formValue: record,
      title: t('token.edit'),
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
              <Form.Item<SearchFormFieldType> label={t('token.email')} name="email" className="!mb-0">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6} lg={6}>
              <Form.Item<SearchFormFieldType> label="Unique Name" name="uniqueName" className="!mb-0">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12} lg={12}>
              <div className="flex justify-end">
                <Button onClick={onSearchFormReset}>{t('token.reset')}</Button>
                <Button type="primary" className="ml-4" onClick={() => {
                  searchForm.validateFields().then((values) => {
                    console.log(values)
                    searchForm.submit()
                  })
                }}>
                  {t('token.search')}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title={t('token.shareList')}
      >
        <Table
          rowKey={record => record.accountId + record.uniqueName}
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10 }}
          columns={columns}
          dataSource={data}
        />
      </Card>
      <ShareModal {...shareModalProps}/>
    </Space>
  );
}
