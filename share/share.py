import json
from datetime import datetime

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from loguru import logger
from sqlalchemy import and_, text

from model import db, User
from util import share_tools
from util.api_response import ApiResponse
from util.pandora_tools import sync_pandora

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


@share_bp.route('/list')
@jwt_required()
def share_list():
    accounts = db.session.query(User).all()
    return ApiResponse.success(account2share(accounts))


@share_bp.route('/search', methods=['POST'])
@jwt_required()
def search():
    # 根据email和unique_name模糊搜索
    email = request.json.get('email')
    unique_name = request.json.get('unique_name')

    accounts = db.session.query(User).filter(and_(User.email.like(f'%{email}%') if email else text(''), User.share_list.like(f'%{unique_name}%') if unique_name else text(''))).all()
    shares = account2share(accounts)
    if unique_name:
        shares = list(filter(lambda x: unique_name in x['unique_name'], shares))

    return ApiResponse.success(shares)



@share_bp.route('/add', methods=['POST'])
@jwt_required()
def share_add():
    account_id = request.json.get('account_id')
    unique_name = request.json.get('unique_name')
    password = request.json.get('password')
    comment = request.form.get('comment')

    account = db.session.query(User).filter_by(id=account_id).first()

    if account:
        if not account.access_token:
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
            _share_list.append({
                'unique_name': unique_name,
                'password': password,
                'comment': comment,
                'share_token': res['token_key'],
            })
            db.session.query(User).filter_by(id=account_id).update({'share_list': json.dumps(_share_list), 'update_time': datetime.now()})
            db.session.commit()
            sync_pandora()
            return ApiResponse.success({})
    else:
        return ApiResponse.error('账号不存在')


@share_bp.route('/delete', methods=['POST'])
@jwt_required()
def share_delete():
    account_id = request.json.get('account_id')
    unique_name = request.json.get('unique_name')
    user = db.session.query(User).filter_by(id=account_id).first()
    share_list = json.loads(user.share_list)
    for share in share_list:
        if share['unique_name'] == unique_name:
            share_list.remove(share)
            break
    db.session.query(User).filter_by(id=account_id).update(
        {'share_list': json.dumps(share_list), 'update_time': datetime.now()})
    db.session.commit()
    share_tools.get_share_token(user.access_token, unique_name, expires_in=-1)
    sync_pandora()
    return ApiResponse.success({})


@share_bp.route('/update', methods=['POST'])
@jwt_required()
def share_update():
    account_id = request.json.get('account_id')
    unique_name = request.json.get('unique_name')
    password = request.json.get('password')
    comment = request.json.get('comment')
    user = db.session.query(User).filter_by(id=account_id).first()
    share_list = json.loads(user.share_list)
    for share in share_list:
        if share['unique_name'] == unique_name:
            share['password'] = password
            share['comment'] = comment
            break
    db.session.query(User).filter_by(id=account_id).update(
        {'share_list': json.dumps(share_list), 'update_time': datetime.now()})
    db.session.commit()
    sync_pandora()
    return ApiResponse.success({})


@share_bp.route('/statistic', methods=['POST'])
@jwt_required()
def share_info():
    user_id = request.json.get('account_id')
    user = db.session.query(User).filter_by(id=user_id).first()

    if user.access_token is None:
        return ApiResponse.error('请先登录账号')
    share_list = json.loads(user.share_list)
    unique_names = list(map(lambda x: x['unique_name'], share_list))
    info_list = {}
    for share in share_list:
        try:
            info = share_tools.get_share_token_info(share['share_token'], user.access_token)
        except Exception as e:
            logger.error(e)
            return ApiResponse.error('获取分享用户信息失败, 请检查access_token是否有效')
        info_list[share['unique_name']] = info

    models = []
    # 取出所有的model

    for k, v in info_list.items():
        if 'usage' not in v:
            raise Exception('获取分享用户信息失败, 请检查access_token是否有效')
        if 'range' in v['usage']:
            # 删除range键值对
            del v['usage']['range']
        for k1, v1 in v['usage'].items():
            if k1 not in models:
                models.append(k1)

    series = []
    # 组装series
    for model in models:
        data = []
        # 保持顺序一致
        for u_name in unique_names:
            if u_name in info_list and model in info_list[u_name]['usage']:
                data.append(info_list[u_name]['usage'][model])
            else:
                data.append(0)
        s = {
            'name': model,
            'data': data,
        }
        series.append(s)

    return ApiResponse.success({
        "categories": unique_names,
        "series": series
    })