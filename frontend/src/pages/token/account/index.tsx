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
  Space, Spin, Switch, Typography,
} from 'antd';
import Table, {ColumnsType} from 'antd/es/table';
import {useEffect, useState} from 'react';

import ProTag from '@/theme/antd/components/tag';

import {Account, Share} from '#/entity';
import {
  CaretRightFilled,
  CheckCircleTwoTone, DeleteOutlined,
  EditOutlined,
  ExclamationCircleTwoTone, FundOutlined, PauseCircleFilled, PlusOutlined,
  ReloadOutlined, ShareAltOutlined
} from "@ant-design/icons";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import accountService, {
  AccountAddReq,
} from "@/api/services/accountService.ts";
import Password from "antd/es/input/Password";
import {useNavigate} from "react-router-dom";
import {useAddShareMutation} from "@/store/shareStore.ts";
import {
  useAddAccountMutation,
  useDeleteAccountMutation, useRefreshAccountMutation,
  useUpdateAccountMutation
} from "@/store/accountStore.ts";
import Chart from "@/components/chart/chart.tsx";
import useChart from "@/components/chart/useChart.ts";
import shareService from "@/api/services/shareService.ts";
import {useTranslation} from "react-i18next";

type SearchFormFieldType = Pick<Account, 'email'>;

export default function AccountPage() {
  const [searchForm] = Form.useForm();
  const {t} = useTranslation()
  const client = useQueryClient();

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
      custom_type: 'refresh_token',
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

  const [shareInfoModalProps, setShareInfoModalProps] = useState<ShareInfoModalProps>({
    accountId: -1,
    show: false,
    onOk: () => {
      setShareInfoModalProps((prev) => ({...prev, show: false}));
    },
  });

  const columns: ColumnsType<Account> = [
    {title: t('token.email'), dataIndex: 'email', ellipsis: true, align: 'center',
       render: (text) => (
          <Typography.Text style={{maxWidth: 200}} ellipsis={true}>
            {text}
          </Typography.Text>
        )
    },
    {title: t('token.password'), dataIndex: 'password', align: 'center',  ellipsis: true,
      render: (text) => (
          <Typography.Text style={{maxWidth: 200}} ellipsis={true}>
            {text}
          </Typography.Text>
        )
    },
    {
      title: t('token.tokenType'),
      dataIndex: 'token',
      align: 'center',
      width: 100,
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
      title: t('token.loginStatus'),
      dataIndex: 'accessToken',
      align: 'center',
      width: 100,
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
      title: t('token.shareStatus'),
      dataIndex: 'shared',
      align: 'center',
      width: 100,
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
      title: t("token.updateTime"),
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
          <Badge count={record.shareList?.length} style={{zIndex: 9}}>
            <Button icon={<ShareAltOutlined />} onClick={() => navigate({
              pathname: '/token/share',
              search: `?email=${record.email}`,
            })}>
              {t('token.shareList')}
            </Button>
          </Badge>
          <Button icon={<PlusOutlined />} onClick={() => onShareAdd(record)}/>
          <Button icon={<FundOutlined />} onClick={() => onShareInfo(record)}/>
        </Button.Group>
      ),
    },
    {
      title: t('token.action'),
      key: 'operation',
      align: 'center',
      render: (_, record) => (
        <Button.Group>
          <Popconfirm title={t('common.refreshConfirm')} okText="Yes" cancelText="No" placement="left" onConfirm={() => {
            setRefreshAccountId(record.id);
            refreshAccountMutation.mutate(record.id, {
              onSettled: () => setRefreshAccountId(undefined),
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
    queryKey: ['accounts', searchEmail],
    queryFn: () => accountService.searchAccountList(searchEmail)
  })

  const { data: taskStatus } = useQuery({
    queryKey: ['taskStatus'],
    queryFn: () => accountService.statusTask(),
  })

  const startTask = useMutation(accountService.startTask, {
      onSuccess: () => {
        client.invalidateQueries(['taskStatus']);
        console.log('startTask success');
      }
    }
  )

  const stopTask = useMutation(accountService.stopTask, {
      onSuccess: () => {
        client.invalidateQueries(['taskStatus']);
        console.log('stopTask success');
      }
    }
  )

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
        accountId: record.id,
        uniqueName: '',
        password: '',
        comment: '',
      },
    }));
  }

  const onShareInfo = (record: Account) => {
    setShareInfoModalProps((prev) => ({
      ...prev,
      show: true,
      accountId: record.id,
    }));
  }

  const onEdit = (record: Account) => {
    const tokenType = record.refreshToken ? 'refresh_token' : 'session_token';
    const token = record.sessionToken || record.refreshToken || '';

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
              <Form.Item<SearchFormFieldType> label={t('token.email')} name="email" className="!mb-0">
                <Input/>
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
        title={t("token.accountList")}
        extra={
        <Space>
          {taskStatus?.status ?
            <Button icon={<PauseCircleFilled />} onClick={() => stopTask.mutate()}>{t("token.stop")}</Button> :
            <Button icon={<CaretRightFilled />} onClick={() => startTask.mutate()}>{t("token.start")}</Button>
          }
          <Button type="primary" onClick={onCreate}>
            {t("token.createNew")}
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
      <ShareInfoModal {...shareInfoModalProps}/>
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
  const {t} = useTranslation()

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
        <Form.Item<Share> label="Unique Name" name="uniqueName"  required>
          <Input readOnly={title === 'Edit'} disabled={title === 'Edit'} />
        </Form.Item>
        <Form.Item<Share> label={t('token.password')} name="password" required>
          <Input.Password />
        </Form.Item>
        <Form.Item<Share> label={t('token.comment')} name="comment" >
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
  const {t} = useTranslation()

  // useEffect(() => {
  //   form.setFieldsValue({...formValue});
  // }, [formValue, form]);

  const onModalOk = () => {
    form.validateFields().then((values) => {
      setLoading(true)
      onOk(values, setLoading);
    });
  }

  const CustomTokenItem = () =>
    <div>
      <Form.Item<AccountAddReq> label={t("token.tokenType")} name="custom_type" required>
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
        <Form.Item<AccountAddReq> label={t("token.password")} name="password" required>
          <Password/>
        </Form.Item>
        <Form.Item<AccountAddReq> label={t("token.share")} name="shared" labelAlign={'left'}
                                  valuePropName="checked" getValueFromEvent={
          (v) => {
            return v ? 1 : 0;
          }
        } required>
          <Switch/>
        </Form.Item>
        <Collapse items={[{key: '1', label: t("token.customToken"), children: <CustomTokenItem/>}]}/>
      </Form>
    </Modal>
  );
}

type ShareInfoModalProps = {
  accountId: number
  onOk: VoidFunction
  show: boolean;
}

const ShareInfoModal = ({accountId, onOk, show}: ShareInfoModalProps) => {

  const { data: statistic, isLoading } = useQuery({
    queryKey: ['shareInfo', accountId],
    queryFn: () => shareService.getShareStatistic(accountId),
    enabled: show,
  })

  const {t} = useTranslation()

  let chartOptions = useChart({
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
      xaxis:{
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
      <Spin spinning={isLoading} tip={t("token.queryingInfo")}>
        <Chart type="bar" series={statistic?.series || []}  options={chartOptions} height={320}/>
      </Spin>
    </Modal>
  )
}
