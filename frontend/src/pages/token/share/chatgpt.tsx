// import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  Form,
  Input, message,
  Popconfirm,
  Row,
  Space, Switch, Tooltip, Typography,
} from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import {useEffect, useState} from 'react';

import {defaultShare, ChatGPTShare} from '#/entity';
import {
  CheckOutlined, CloseOutlined,
  DeleteOutlined, EditOutlined, RobotOutlined,
} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import {useSearchParams} from "@/router/hooks";
import shareService from "@/api/services/shareService.ts";
import {useDeleteShareMutation, useUpdateShareMutation} from "@/store/shareStore.ts";
import {ShareModal} from "@/pages/token/account/components/ShareModal";
import {ShareModalProps} from "@/pages/token/account/components/ShareModal";
import {useTranslation} from "react-i18next";
import {onCopy} from "@/utils/copy.ts";
type SearchFormFieldType = {
  email?: string;
  uniqueName?: string;
};

export default function SharePage() {
  const {t} = useTranslation()
  const columns: ColumnsType<ChatGPTShare> = [
    { key: 'email', title: t('token.email'), dataIndex: ['account','email'], width: 120,
      render: (text) => (
        <Input value={text} onClick={(e) => onCopy(text, t, e)} readOnly/>
      ),
    },
    { key: 'uniqueName', title: 'Unique Name', dataIndex: 'uniqueName', align: 'center', width: 120 },
    { key: 'password', title: t('token.password'), dataIndex: 'password', align: 'center', width: 120 },
    {
      title: "次数限制",
      key: "usageLimit",
      children: [
        { key: '4o-mini', title: '4o-mini', dataIndex: 'gpt4oMiniLimit', align: 'center', width: 100,
          render: text => text == -1 ? '无限制' : text
        },
        { key: 'gpt4o', title: '4o', dataIndex: 'gpt4oLimit', align: 'center', width: 100,
          render: text => text == -1 ? '无限制' : text
        },
        { key: 'gpt4', title: 'gpt4', dataIndex: 'gpt4Limit', align: 'center', width: 100,
          render: text => text == -1 ? '无限制' : text
        },
        { key: 'o1', title: 'o1', dataIndex: 'o1Limit', align: 'center', width: 100,
          render: text => text == -1 ? '无限制' : text
        },
        { key: 'o1-mini', title: 'o1-mini', dataIndex: 'o1MiniLimit', align: 'center', width: 100,
          render: text => text == -1 ? '无限制' : text
        },
      ]
    },
    { key: 'refreshEveryday', title: t('token.refreshEveryday'), dataIndex: 'refreshEveryday', align: 'center', width: 120,
      render: text => text ? <CheckOutlined /> : <CloseOutlined />
    },
    { key: 'temporaryChat', title: t('token.temporaryChat'), dataIndex: 'temporaryChat', align: 'center', width: 80,
      render: text => text ? <CheckOutlined /> : <CloseOutlined />
    },
    { key: 'expiresAt', title: t('token.expiresAt'), dataIndex: 'expiresAt', align: 'center', width: 120,
      render: text => text == "" ? '未知' : text
    },
    { key: 'shareToken', title: 'Share Token', dataIndex: 'shareToken', align: 'center', width: 120,
      render: (text) => (
        <Input value={text} onClick={(e) => onCopy(text, t, e)} readOnly/>
      ),
    },
    { key: 'comment', title: t('token.comment'), dataIndex: 'comment', align: 'center',
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
          <Tooltip title={"登录并跳转至对话"} placement={"bottom"}>
            <Button icon={<RobotOutlined />} type={"primary"} onClick={() => onChatLogin(record)}/>
          </Tooltip>
          <Button icon={<EditOutlined />} type={"primary"} onClick={() => onEdit(record)}/>
          <Popconfirm title={t('token.deleteConfirm')} okText="Yes" cancelText="No" placement="left" onConfirm={() => handleDelete(record)}>
            <Button icon={<DeleteOutlined />} type={"primary"} loading={deleteRowKey == record.accountId + record.uniqueName}  danger/>
          </Popconfirm>
        </Button.Group>
      ),
    },
  ];

  const simpleColumns = ['uniqueName','usageLimit','expiresAt','comment','operation']

  const detailColumns = columns.map(column => column.key)

  const deleteShareMutation = useDeleteShareMutation()
  const updateShareMutation = useUpdateShareMutation()

  const [loading, setLoading] = useState(false)

  const params = useSearchParams();
  const [searchForm] = Form.useForm();
  const email = Form.useWatch('email', searchForm);
  const uniqueName = Form.useWatch('uniqueName', searchForm);

  const [displayColumns, setDisplayColumns] = useState(simpleColumns);
  const [deleteRowKey, setDeleteRowKey] = useState<string | undefined>(undefined);
  const [shareModalProps, setShareModalProps] = useState<ShareModalProps>({
    formValue: {...defaultShare},
    title: t('token.edit'),
    show: false,
    onOk: (values: ChatGPTShare) => {
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

  const onEdit = (record: ChatGPTShare) => {
    setShareModalProps({
      formValue: record,
      title: t('token.edit'),
      show: true,
      onOk: (values: ChatGPTShare, callback) => {
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

  const onChatLogin = (record: ChatGPTShare) => {
    setLoading(true)
    message.info({content: "正在跳转至对话...", key: 'chatLogin', duration: 5})
    shareService.chatLoginShare(record.uniqueName, record.password)
      .then((data) => {
        if(data){
          window.open(data, '_blank')
        }
      }).finally(() => {
        setLoading(false)
      })
  }

  const handleDelete = (record: ChatGPTShare) => {
    setDeleteRowKey(record.accountId + record.uniqueName)
    deleteShareMutation.mutate(record, {
      onSettled: () => {
        setDeleteRowKey(undefined)
      }
    })
  }

  const { data } = useQuery({
    queryKey: ['shareList','chatgpt', email, uniqueName],
    queryFn: () => {
      return shareService.searchShare("chatgpt", email, uniqueName)
    }
  })

  const onSearchFormReset = () => {
    searchForm.resetFields();
  };

  const onSwitchChange = (checked: boolean) => {
    setDisplayColumns((checked ? [...simpleColumns] : [...detailColumns]) as string[])
  }

  const newColumns = columns.map((item) => ({
    ...item,
    hidden: !displayColumns.includes(item.key as string),
  }));

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
        extra={
          <Switch
            title={"abc"}
            defaultChecked
            checkedChildren={"简洁"}
            unCheckedChildren={"详细"}
            onChange={onSwitchChange}
          />
        }
      >
        <Table
          rowKey={record => record.accountId + record.uniqueName}
          bordered
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10 }}
          columns={newColumns}
          dataSource={data}
          loading={loading}
        />
      </Card>
      <ShareModal {...shareModalProps}/>
    </Space>
  );
}
