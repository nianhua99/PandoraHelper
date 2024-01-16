import requests
from loguru import logger
from flask import current_app


def get_host():
    return current_app.config['pandora_domain'] + '/' + current_app.config['proxy_api_prefix']


# 本类用于封装share_token 相关操作

# 获取share_token /api/token/register
def get_share_token(access_token, unique_name, expires_in=0, show_conversations=False, show_userinfo=True):
    host = get_host()
    payload = (f'unique_name={unique_name}&access_token={access_token}'
               f'&expires_in={expires_in}'
               f'&show_conversations=false&show_userinfo=true')
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    response = requests.request("POST", host + "/api/token/register", headers=headers, data=payload)
    # 如果返回的状态码不是200，则抛出异常
    logger.info("{}获取share_token结果：{}", unique_name, response.text)
    if response.status_code != 200:
        raise Exception("获取share_token失败")
    return response.json()


# 获取share_token的信息 /api/token/info/<share_token>
# 若access_token 不为空，则返回的信息中包含share_token的详细用量信息
def get_share_token_info(share_token, access_token=None):
    host = get_host()
    headers = {}
    if access_token:
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
    url = f'/api/token/info/{share_token}'
    response = requests.request("GET", host + url, headers=headers, data={})
    logger.info("获取share_token信息结果：{}", response.json())
    return response.json()
