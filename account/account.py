from datetime import datetime

from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from model import db, User
from util import login_tools
from util.api_response import ApiResponse
from loguru import logger

account_bp = Blueprint('account_bp', __name__)


@jwt_required
@account_bp.route('/list')
def account_list():
    accounts = db.session.query(User).all()
    return ApiResponse.success(accounts)


@jwt_required
@account_bp.route('/add', methods=['POST'])
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

    return ApiResponse.success({})


@jwt_required
@account_bp.route('/update', methods=['POST'])
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

    return ApiResponse.success({})


@jwt_required
@account_bp.route('/delete', methods=['POST'])
def account_delete():
    account_id = request.json.get('id')
    user = db.session.query(User).filter_by(id=account_id).first()
    db.session.delete(user)
    db.session.commit()
    return ApiResponse.success({})


