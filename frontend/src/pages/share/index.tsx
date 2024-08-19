import {useQuery} from "@tanstack/react-query";
import accountService from "@/api/services/accountService.ts";
import {Button, Col, Flex, Layout, Row, Spin, Typography} from "antd";
import {Account, ProductType} from "#/entity.ts";
import {CheckCircleOutlined} from "@ant-design/icons";
import {Iconify} from "@/components/icon";
import {CSSProperties, useEffect} from "react";
import SlideUnlock from "@/components/SlideUnlock";
import {nanoid} from "nanoid";
import Swal from 'sweetalert2'
import '@sweetalert2/theme-bulma/bulma.scss'

export default function ExternalShare() {

  useEffect(() => {
    document.title = "Share Account"
  }, [])

  const {data, isLoading} = useQuery({
    queryKey: ['accounts', 'share'],
    refetchInterval: 1000 * 60 * 5,
    queryFn: () => accountService.getShareAccountList(),
  });

  const Icon = (accountType: ProductType) => {
    let styles: CSSProperties = {
      position: 'absolute',
      bottom: '10px',
      right: '10px',
      fontSize: '20px',
      color: 'green',
      opacity: 0.7
    }
    switch (accountType) {
      case "chatgpt":
        styles.color = 'black';
        return <Iconify icon={'simple-icons:openai'} style={styles}/>;
      case "claude":
        styles.color = 'rgb(217, 119, 87)';
        return <Iconify icon={'simple-icons:anthropic'} style={styles}/>;
      default:
        return <CheckCircleOutlined style={styles}/>;
    }
  }

  const handleLogin = async (id: number, uniqueName: string, selectType: string) => {
    window.location = await accountService.loginFreeAccount({
      id,
      UniqueName: uniqueName,
      SelectType: selectType
    })
  }

  const handleRandomLogin = () => {
    const uniqueName = nanoid(10);
    //随机选择一个id
    const id = data?.accounts[Math.floor(Math.random() * data?.accounts?.length)].id;
    if (!id){
      return;
    }
    handleLogin(id, uniqueName, 'random')
  }

  const handleCustomLoginModal = async (id: number) => {
    await Swal.fire({
      title: "设置密码以隔离会话",
      input: "text",
      inputLabel: "你的专属密码（6位以上）",
      showLoaderOnConfirm: true,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "你需要输入一个专属的密码";
        } else if (value.length < 6) {
          return "密码长度至少6位";
        }
      },
      preConfirm: async (value) => {
        await handleLogin(id, value, 'custom')
      },
      allowOutsideClick: () => !Swal.isLoading()
    });
  }

  return (
    <div>
      <div style={{maxWidth: 1200, margin: '0 auto'}} className={'pl-1 pr-1'}>
        <div>
          <Typography.Title level={1} className={'text-center mt-5'}>
            本页面中包含一些免费的共享ChatGPT/Claude账号
          </Typography.Title>
          <Typography.Title level={3} className={'text-center mt-5'}>
            以下链接每个都代表一个ChatGPT账号，点击即可访问。由于是共享的，遇忙可以选择其他的或等待一会。
          </Typography.Title>
        </div>
        {isLoading ? <Spin size={'large'} style={{width: '100%', margin: '20px auto'}}/> :
          <>
            {data?.random && data.accounts.length > 0 &&
              <Flex justify={'center'} className={'mt-10 mb-10'}>
                <SlideUnlock onUnlock={handleRandomLogin}/>
              </Flex>}
            {data?.custom &&
              <Row gutter={[8, 8]} className={'mt-10 mb-5'} justify="center" wrap>
                {data?.accounts?.map((item: Account) => (
                  <Col xs={12} sm={8} md={8} lg={4} xl={4} key={item.id}>
                    <Button
                      style={{width: '100%', height: 100, fontWeight: 700}}
                      onClick={() => handleCustomLoginModal(item.id)}
                    >
                      {item.id}
                      {Icon(item.accountType)}
                    </Button>
                  </Col>
                ))}
              </Row>
            }
          </>
        }
      </div>
      <Layout.Footer>
        <Flex justify={'center'} className={'w-full'}>
          <Typography.Title level={5}>
            Build by PandoraHelper
          </Typography.Title>
        </Flex>
      </Layout.Footer>
    </div>
  );
}


