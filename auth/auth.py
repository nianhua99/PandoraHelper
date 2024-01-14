import datetime

import requests
from flask import request, current_app, Blueprint
from flask_jwt_extended import create_access_token

from util.api_response import ApiResponse

auth_bp = Blueprint("auth", __name__)


def validate_hcaptcha_response(token):
    secret_key = current_app.config['captcha_secret_key']
    verify_url = "https://api.hcaptcha.com/siteverify"
    payload = {
        'secret': secret_key,
        'response': token
    }
    r = requests.post(verify_url, data=payload)
    result = r.json()
    return result['success']


@auth_bp.route('/login2', methods=['POST'])
# 使用Jwt登录
def login2():
    password = request.json.get('password')
    token = request.json.get('token')
    if current_app.config['captcha_enabled'] and not validate_hcaptcha_response(token):
        return ApiResponse.error('Captcha is failed', 401)
    if password == current_app.config['setup_password']:
        user = {
            'id': 1,
            'username': 'admin',
            'email': 'admin@uasm.com',
            'role': ADMIN_ROLE,
            'status': 1,
            'permissions': PERMISSION_LIST,
        }
        access_token = create_access_token(identity='admin', expires_delta=datetime.timedelta(days=3))
        return ApiResponse.success(data={'access_token': access_token, 'user': user})
    else:
        return ApiResponse.error('login failed！', 401)


DASHBOARD_PERMISSION = {
    'id': '9710971640510357',
    'parentId': '',
    'label': 'sys.menu.analysis',
    'name': 'Analysis',
    'type': 1,
    'route': 'home',
    'icon': 'ic-analysis',
    'order': 1,
    'component': '/dashboard/analysis/index.tsx',
}

TOKEN_PERMISSION = {
    'id': '9100714781927721',
    'parentId': '',
    'label': 'sys.menu.token',
    'name': 'Token',
    'icon': 'ph:key',
    'type': 0,
    'route': 'token',
    'order': 2,
    'children': [
        {
            'id': '84269992294009655',
            'parentId': '9100714781927721',
            'label': 'sys.menu.account',
            'name': 'Account',
            'type': 1,
            'route': 'account',
            'component': '/token/account/index.tsx',
        },
        {
            'id': '84269992294009656',
            'parentId': '9100714781927721',
            'hide': False,
            'label': 'sys.menu.share',
            'name': 'Share',
            'type': 1,
            'route': 'share',
            'component': '/token/share/index.tsx',
        }
    ],
}

PERMISSION_LIST = [
    DASHBOARD_PERMISSION,
    TOKEN_PERMISSION,
]

ADMIN_ROLE = {
    'id': '4281707933534332',
    'name': 'Admin',
    'label': 'Admin',
    'status': 1,
    'order': 1,
    'desc': 'Super Admin',
    'permission': PERMISSION_LIST,
}
