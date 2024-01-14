import json
from datetime import datetime

from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from model import db, User
from util import login_tools, share_tools, pandora_tools
from util.api_response import ApiResponse
from loguru import logger

from util.pandora_tools import sync_pandora

account_bp = Blueprint('account_bp', __name__)


@jwt_required()
@account_bp.route('/list')
def account_list():
    accounts = db.session.query(User).all()
    return ApiResponse.success(accounts)



@account_bp.route('/search', methods=['POST'])
@jwt_required()
def account_search():
    email = request.json.get('email') if request.json.get('email') else ''
    accounts = db.session.query(User).filter(User.email.like(f'%{email}%')).all()
    return ApiResponse.success(accounts)



@account_bp.route('/add', methods=['POST'])
@jwt_required()
def account_add():
    email = request.json.get('email')
    password = request.json.get('password')
    custom_token_type = request.json.get('custom_type')
    custom_token = request.json.get('custom_token')
    shared = 1 if request.json.get('shared') else 0

    user = User(email=email, password=password, shared=shared,
                share_list='[]',
                create_time=datetime.now(),
                update_time=datetime.now())

    if custom_token != '':
        if custom_token_type == 'session_token':
            user.session_token = custom_token
        elif custom_token_type == 'refresh_token':
            user.refresh_token = custom_token

    if custom_token == '' and custom_token_type == 'refresh_token':
        try:
            res = login_tools.get_refresh_token(email, password)
            user.refresh_token = res['refresh_token']
        except Exception as e:
            logger.error(e)

    logger.info(user)

    db.session.add(user)
    db.session.commit()

    sync_pandora()
    return ApiResponse.success({})


@account_bp.route('/update', methods=['POST'])
@jwt_required()
def account_update():
    account_id = request.json.get('id')
    email = request.json.get('email')
    password = request.json.get('password')
    custom_token_type = request.json.get('custom_type')
    custom_token = request.json.get('custom_token')
    shared = 1 if request.json.get('shared') else 0

    user = db.session.query(User).filter_by(id=account_id).first()
    user.email = email
    user.password = password
    user.shared = shared
    user.update_time = datetime.now()

    if custom_token != '':
        if custom_token_type == 'session_token':
            user.session_token = custom_token
        elif custom_token_type == 'refresh_token':
            user.refresh_token = custom_token

    if custom_token == '' and custom_token_type == 'refresh_token':
        try:
            res = login_tools.get_refresh_token(email, password)
            user.refresh_token = res['refresh_token']
        except Exception as e:
            logger.error(e)
    # 更新用户

    db.session.commit()
    sync_pandora()
    return ApiResponse.success({})


@account_bp.route('/delete', methods=['POST'])
@jwt_required()
def account_delete():
    account_id = request.json.get('id')
    user = db.session.query(User).filter_by(id=account_id).first()
    db.session.delete(user)
    db.session.commit()
    return ApiResponse.success({})


@account_bp.route('/refresh', methods=['POST'])
@jwt_required()
def account_refresh():
    account_id = request.json.get('id')
    try:
        refresh(account_id)
    except Exception as e:
        return ApiResponse.error(str(e))
    sync_pandora()
    return ApiResponse.success('刷新成功')


def refresh_all_user():
    from app import scheduler
    flag = False
    with scheduler.app.app_context():
        users = db.session.query(User).all()
        for user in users:
            try:
                # jwt解析access_token 检查access_token是否过期
                if user.access_token is None:
                    continue
                else:
                    token_info = pandora_tools.get_email_by_jwt(user.access_token)
                    # 根据exp判断是否过期,如果过期则刷新
                    exp_time = datetime.fromtimestamp(token_info['exp'])
                    if exp_time > datetime.now():
                        continue
                flag = True
                refresh(user.id)
            except Exception as e:
                logger.error(e)
        if flag:
            sync_pandora()
            logger.info('刷新成功')


@account_bp.route('/start', methods=['post'])
@jwt_required()
def refresh_task():
    from app import scheduler
    scheduler.add_job(func=refresh_all_user, trigger='interval', minutes=1, id='my_job')
    if not scheduler.running:
        scheduler.start()
    return ApiResponse.success('定时刷新已开启')


@account_bp.route('/stop', methods=['post'])
@jwt_required()
def kill_refresh_task():
    from app import scheduler
    scheduler.remove_job(id='my_job')
    return ApiResponse.success('定时刷新已关闭')


@account_bp.route('/task_status')
@jwt_required()
def refresh_status():
    from app import scheduler
    if scheduler.running and scheduler.get_job(id='my_job') is not None:
        return ApiResponse.success({'status': True})
    else:
        return ApiResponse.success({'status': False})


def refresh(user_id):
    user = db.session.query(User).filter_by(id=user_id).first()

    if user is None:
        raise Exception('用户不存在')

    def login_by_refresh_token():
        try:
            refresh_token_result = login_tools.get_access_token_by_refresh_token(user.refresh_token)
        except Exception as e:
            raise e
        return refresh_token_result['access_token']

    def login_by_password():
        try:
            login_result = login_tools.login(user.email, user.password)
        except Exception as e:
            raise e
        access_token = login_result['access_token']
        session_token = login_result['session_token']
        return access_token, session_token

    def login_by_session_token():
        try:
            access_token_result = login_tools.get_access_token(user.session_token)
        except Exception as e:
            raise e
        access_token = access_token_result['access_token']
        session_token = access_token_result['session_token']
        return access_token, session_token

    # 如果Refresh Token存在则使用Refresh Token刷新，否则使用Session Token刷新，都为空或失败则使用密码刷新保底
    # Refresh Token刷新仅更新access_token
    # Session Token刷新和登录刷新，则更新access_token和session_token，并且以后使用Session Token刷新

    access_token, session_token = None, None

    if user.refresh_token is not None:
        try:
            access_token = login_by_refresh_token()
            db.session.query(User).filter_by(id=user_id).update(
                {'access_token': access_token, 'update_time': datetime.now()})
            db.session.commit()
        except Exception as e:
            logger.error(e)

    else:
        if user.session_token is not None:
            try:
                access_token, session_token = login_by_session_token()
                db.session.query(User).filter_by(id=user_id).update(
                    {'access_token': access_token, 'session_token': session_token, 'update_time': datetime.now()})
                db.session.commit()
            except Exception as e:
                logger.error(e)

    if access_token is None:
        try:
            access_token, session_token = login_by_password()
            db.session.query(User).filter_by(id=user_id).update(
                {'access_token': access_token, 'session_token': session_token, 'update_time': datetime.now()})
            db.session.commit()
        except Exception as e:
            logger.error(e)
            # 保底刷新失败
            raise e

    # 刷新share_token
    share_list = json.loads(user.share_list)
    if len(share_list) == 0:
        # 没有share token，直接返回
        return
    for share in share_list:
        try:
            share_token = share_tools.get_share_token(access_token, share['unique_name'])
        except Exception as e:
            # 返回刷新失败
            logger.error(e)
            raise e
        share['share_token'] = share_token['token_key']
    # 更新share_list
    db.session.query(User).filter_by(id=user_id).update(
        {'share_list': json.dumps(share_list), 'update_time': datetime.now()})
    db.session.commit()
