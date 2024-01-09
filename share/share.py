import json
from datetime import datetime

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from sqlalchemy import and_, text

from model import db, User
from util import login_tools, share_tools
from util.api_response import ApiResponse
from loguru import logger

share_bp = Blueprint('share_bp', __name__)


def account2share(accounts):
    shares = []
    for account in accounts:
        _share_list = json.loads(account.share_list)
        for share in _share_list:
            share['email'] = account.email
            share['account_id'] = account.id
            shares.append(share)
    return shares


@jwt_required
@share_bp.route('/list')
def share_list():
    accounts = db.session.query(User).all()
    return ApiResponse.success(account2share(accounts))


@jwt_required
@share_bp.route('/search', methods=['POST'])
def search():
    # 根据email和unique_name模糊搜索
    email = request.json.get('email')
    unique_name = request.json.get('unique_name')

    accounts = db.session.query(User).filter(and_(User.email.like(f'%{email}%') if email else text(''), User.share_list.like(f'%{unique_name}%') if unique_name else text(''))).all()
    shares = account2share(accounts)
    if unique_name:
        shares = list(filter(lambda x: unique_name in x['unique_name'], shares))

    return ApiResponse.success(shares)


@jwt_required
@share_bp.route('/add', methods=['POST'])
def share_add():
    account_id = request.json.get('id')
    unique_name = request.json.get('unique_name')
    password = request.json.get('password')
    comment = request.form.get('comment')

    account = db.session.query(User).filter_by(id == account_id).first()
    if account:
        if account.access_token == '':
            return ApiResponse.error('请先登录账号')
        else:
            try:
                res = share_tools.get_share_token(account.access_token, unique_name)
            except Exception as e:
                logger.error(e)
                return ApiResponse.error('生成分享用户失败')
            _share_list = json.loads(account.share_list)
            for share in _share_list:
                if share['unique_name'] == unique_name:
                    _share_list.remove(share)
            _share_list.add({
                'unique_name': unique_name,
                'password': password,
                'comment': comment,
                'share_token': res['token_key'],
            })
            db.session.query(User).filter_by(id == account_id).update({'share_list': json.dumps(_share_list), 'update_time': datetime.now()})
            db.session.commit()
            return ApiResponse.success({})
    else:
        return ApiResponse.error('账号不存在')