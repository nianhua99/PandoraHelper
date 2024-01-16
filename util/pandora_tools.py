import json

import requests
import jwt
from cachetools import cached, TTLCache
from loguru import logger
from flask import current_app

from model import User, db


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
        return {"current": 0, "total": 1}
    return {
        "current": response.json().get('current', 0),
        "total": int(response.json().get('total')),
        "ttl": response.json().get('ttl', 0),
    }


# 清空ChatGPT聊天记录
def clear_all_chat(access_token):
    host = get_host()
    data = {
        "is_visible": False
    }
    headers = {
        "Authorization": "Bearer " + access_token
    }
    response = requests.request("POST", host + "/backend-api/conversations", headers=headers, data=data)
    logger.info("清空聊天记录：{}", response.text)
    if response.status_code != 200:
        raise Exception("清空聊天记录失败")


def export_all_chat(access_token):
    host = get_host()
    headers = {
        "Authorization": "Bearer " + access_token
    }
    response = requests.request("POST", host + "/backend-api/accounts/data_export", headers=headers)
    logger.info("导出聊天记录：{}", response.text)
    if response.status_code != 200:
        raise Exception("导出聊天记录失败")


def get_email_by_jwt(token):
    # 解析token
    return jwt.decode(token, algorithms=['HS256'], options={"verify_signature": False})


def make_json():
    from flask import current_app
    import os
    users = db.session.query(User).all()

    with open(os.path.join(current_app.config['pandora_path'], 'tokens.json'), 'r') as f:
        tokens = json.loads(f.read())
    # 丢弃原json中token字段以fk开头的键值对
    for key in list(tokens.keys()):
        if tokens[key] and tokens[key]['token'] and tokens[key]['token'].startswith('fk'):
            tokens.pop(key)
    # 将share_list转换为json对象
    for user in users:
        # 当存在share_list时, 取所有share_token, 并写入tokens.json
        if user.share_list is not None and user.share_list != '[]':
            share_list = json.loads(user.share_list)
            for share in share_list:
                # json中有share_token和password才写入
                if 'share_token' in share and 'password' in share:
                    tokens[share['unique_name']] = {
                        'token': share['share_token'],
                        'password': share['password']
                    }
        else:
            if not user.access_token:
                continue
            if not user.session_token and not user.refresh_token:
                continue
            # 当不存在share_list时, 取session_token, 并写入tokens.json
            # Todo 自定义 plus / show_user_info
            tokens[user.email] = {
                'token': user.access_token,
                # Todo 自定义
                'show_user_info': False,
            }
            if user.shared == 1:
                tokens[user.email]['shared'] = True
            else:
                tokens[user.email]['shared'] = False
                tokens[user.email]['password'] = user.password
    # 检测当前是否存在tokens.json,如果有则备份,文件名为tokens.json + 当前时间
    if os.path.exists(os.path.join(current_app.config['pandora_path'], 'tokens.json')):
        import time
        os.rename(os.path.join(current_app.config['pandora_path'], 'tokens.json'),
                  os.path.join(current_app.config['pandora_path'],
                               'tokens.json.' + time.strftime("%Y%m%d%H%M%S", time.localtime())))

    # 将数据写入tokens.json
    with open(os.path.join(current_app.config['pandora_path'], 'tokens.json'), 'w') as f:
        # 美化json
        f.write(json.dumps(tokens, indent=4))


def sync_pandora():
    make_json()
    fresh_setup()
