import json

import requests
import jwt
from cachetools import cached, TTLCache
from loguru import logger
from flask import current_app


def get_host():
    return current_app.config['pandora_domain'] + '/' + current_app.config['proxy_api_prefix']


def fresh_setup():
    host = get_host()
    response = requests.request("POST", host + "/api/setup/reload")
    logger.info("重载：{}", response.json())
    if response.status_code != 200:
        raise Exception("重载失败")
    return response.json()


# 1分钟缓存
@cached(cache=TTLCache(ttl=60, maxsize=1))
def get_balance():
    response = requests.request("GET", f"https://dash.pandoranext.com/api/{current_app.config['license_id']}/usage")
    if response.status_code != 200 or 'current' not in response.json():
        return {"current": 0,"total": "1"}
    return response.json()


# 清空ChatGPT聊天记录
def clear_all_chat(access_token):
    host = get_host()
    data = {
        "is_visible": False
    }
    headers = {
        "Authorization": "Bearer " + access_token
    }
    response = requests.request("PUT", host + "/backend-api/conversations", headers=headers, data=data)
    logger.info("清空聊天记录：{}", response.json())
    if response.status_code != 200:
        raise Exception("清空聊天记录失败")


def export_all_chat(access_token):
    host = get_host()
    headers = {
        "Authorization": "Bearer " + access_token
    }
    response = requests.request("POST", host + "/accounts/data_export", headers=headers)
    logger.info("导出聊天记录：{}", response.json())
    if response.status_code != 200:
        raise Exception("导出聊天记录失败")


def get_email_by_jwt(token):
    # 解析token
    return jwt.decode(token, algorithms=['HS256'], options={"verify_signature": False})
