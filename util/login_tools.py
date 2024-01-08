import requests
import jwt
from loguru import logger
from flask import current_app
import urllib.parse


def get_host():
    return current_app.config['pandora_domain'] + '/' + current_app.config['proxy_api_prefix']


# 本类用于封装登录相关操作，包括登录、获取session_token、获取access_token、获取用户信息等

# 使用用户名和密码登录 /api/auth/login
def login(username, password):
    host = get_host()
    payload = f'username={urllib.parse.quote(username)}&password={urllib.parse.quote(password)}'
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    response = requests.request("POST", host + "/api/auth/login", headers=headers, data=payload)
    logger.info("登录结果：{},{}", response.text, response.status_code)
    if response.status_code != 200:
        if response.status_code == 404:
            raise Exception("接口不存在,请检查Pandora是否配置正确")
        raise Exception(response.text)
    return response.json()


# 使用session_token获取access_token /api/auth/session
def get_access_token(session_token):
    host = get_host()
    payload = f'session_token={session_token}'
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    response = requests.request("POST", host + "/api/auth/session", headers=headers, data=payload)
    logger.info("获取access_token结果：{},{}", response.text, response.status_code)
    if response.status_code != 200:
        raise Exception("获取access_token失败")
    return response.json()


# 获取Refresh Token
def get_refresh_token(username, password):
    host = get_host()
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    payload = {
        'username': username,
        'password': password
    }
    response = requests.request("POST", host + "/api/auth/login2", headers=headers, data=payload)
    logger.info("获取refresh_token结果：{},{}", response.text, response.status_code)

    if response.status_code != 200:
        raise Exception("获取refresh_token失败")

    return response.json()


# 使用refresh_token获取access_token /api/auth/refresh
def get_access_token_by_refresh_token(refresh_token):
    host = get_host()
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    payload = {
        'refresh_token': refresh_token
    }
    response = requests.request("POST", host + "/api/auth/refresh", headers=headers, data=payload)
    logger.info("获取access_token结果：{},{}", response.text, response.status_code)
    if response.status_code != 200:
        raise Exception("获取access_token失败")
    return response.json()
