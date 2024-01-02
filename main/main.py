import json
from datetime import datetime
from loguru import logger

from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required

from model import db
import login_tools
import share_tools
import pandora_tools
from model import User

main_bp = Blueprint('main', __name__)


@main_bp.route('/manage-users')
@login_required
def manage_users():
    from app import scheduler
    users = db.session.query(User).all()
    # 将share_list转换为json对象
    for user in users:
        user.share_list = json.loads(user.share_list)
    job_started = scheduler.get_job(id='my_job') is not None
    return render_template('manage_users.html',
                           users=users, job_started=job_started, balance=pandora_tools.get_balance())


@main_bp.route('/add-user', methods=['POST'])
@login_required
def add_user():
    email = request.form['email']
    password = request.form['password']
    custom_token_type = request.form['custom_token_type']
    custom_token = request.form['custom_token']

    if 'shared' in request.form:
        shared = 1 if request.form['shared'] == 'on' else 0
    else:
        shared = 0

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

    db.session.add(user)
    db.session.commit()

    return redirect(url_for('main.manage_users'))


@main_bp.route('/delete-user/<int:user_id>')
@login_required
def delete_user(user_id):
    db.session.query(User).filter_by(id=user_id).delete()
    db.session.commit()
    return redirect(url_for('main.manage_users'))


@main_bp.route('/add-share', methods=['POST'])
@login_required
def add_share():
    user_id = request.form.get('user_id')
    unique_name = request.form.get('unique_name')
    password = request.form.get('password')
    user = db.session.query(User).filter_by(id=user_id).first()
    try:
        share_token = share_tools.get_share_token(user.access_token, unique_name)
    except Exception as e:
        flash('添加失败: ' + str(e), 'error')
        return redirect(url_for('main.manage_users'))
    share_list = json.loads(user.share_list)
    # 检查是否已经存在
    for share in share_list:
        if share['unique_name'] == unique_name:
            # 删除原有的share_token
            share_list.remove(share)
    share_list.append({'unique_name': unique_name, 'password': password, 'share_token': share_token['token_key']})
    db.session.query(User).filter_by(id=user_id).update(
        {'share_list': json.dumps(share_list), 'update_time': datetime.now()})
    db.session.commit()
    flash('添加成功', 'success')
    return redirect(url_for('main.manage_users'))


@main_bp.route('/delete-share/<int:user_id>/<unique_name>')
@login_required
def delete_share(user_id, unique_name):
    user = db.session.query(User).filter_by(id=user_id).first()
    share_list = json.loads(user.share_list)
    for share in share_list:
        if share['unique_name'] == unique_name:
            share_list.remove(share)
            break
    db.session.query(User).filter_by(id=user_id).update(
        {'share_list': json.dumps(share_list), 'update_time': datetime.now()})
    db.session.commit()
    share_tools.get_share_token(user.access_token, unique_name, expires_in=-1)
    flash('删除成功', 'success')
    return redirect(url_for('main.manage_users'))


# 获取ShareToken用量信息
@main_bp.route('/share-info/<int:user_id>')
def share_info(user_id):
    user = db.session.query(User).filter_by(id=user_id).first()
    if user.access_token is None:
        return jsonify({'code': 500, 'msg': '请先刷新'})
    share_list = json.loads(user.share_list)
    dims = []
    sources = []
    for share in share_list:
        info = share_tools.get_share_token_info(share['share_token'], user.access_token)
        if 'usage' in info:
            if 'range' in info['usage']:
                # 删除range键值对
                del info['usage']['range']
        temp = {'UniqueNames': share['unique_name']}
        for k, v in info['usage'].items():
            # 尝试转换为int
            try:
                v = int(v)
            except:
                pass
            temp[k] = v
            dims.append(k)
        sources.append(temp)
    dims = list(set(dims))
    # 在dims的头部插入UniqueNames
    dims.insert(0, 'UniqueNames')
    return jsonify({
        "dims": dims,
        "source": sources
    })


def refresh(user_id):
    user = db.session.query(User).filter_by(id=user_id).first()

    if user is None:
        return redirect(url_for('main.manage_users'))

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
            raise e

    # 刷新share_token
    share_list = json.loads(user.share_list)
    if len(share_list) == 0:
        # 没有share token，直接返回
        return redirect(url_for('main.manage_users'))
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
    return redirect(url_for('main.manage_users'))


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


@main_bp.route('/start_timer')
@login_required
def refresh_task():
    from app import scheduler
    scheduler.add_job(func=refresh_all_user, trigger='interval', minutes=1, id='my_job')
    if not scheduler.running:
        scheduler.start()
    return redirect(url_for('main.manage_users'))


@main_bp.route('/kill_timer')
@login_required
def kill_refresh_task():
    from app import scheduler
    scheduler.remove_job(id='my_job')
    return redirect(url_for('main.manage_users'))


@main_bp.route('/refresh/<int:user_id>')
@login_required
def refresh_route(user_id):
    try:
        refresh(user_id)
        sync_pandora()
    except Exception as e:
        return jsonify({'code': 500, 'msg': '刷新失败: ' + str(e)}), 500
    return redirect(url_for('main.manage_users'))


@main_bp.route('/clear_chat/<int:user_id>')
@login_required
def clear_chat(user_id):
    user = db.session.query(User).filter_by(id=user_id).first()
    if user['access_token'] is None:
        return jsonify({'code': 500, 'msg': '请先刷新'}), 500
    try:
        pandora_tools.clear_all_chat(user.access_token)
    except Exception as e:
        return jsonify({'code': 500, 'msg': '清空失败: ' + str(e)}), 500


@main_bp.route('/export_chat/<int:user_id>')
@login_required
def export_chat(user_id):
    user = db.session.query(User).filter_by(id=user_id).first()
    if user['access_token'] is None:
        return jsonify({'code': 500, 'msg': '请先刷新'}), 500
    try:
        pandora_tools.export_all_chat(user.access_token)
    except Exception as e:
        return jsonify({'code': 500, 'msg': '清空失败: ' + str(e)}), 500


def make_json():
    from flask import current_app
    import os
    users = db.session.query(User).all()

    with open(os.path.join(current_app.config['pandora_path'], 'tokens.json'), 'r') as f:
        tokens = json.loads(f.read())
    # "test2": {
    #     "token": "fk-BP975vvI1w3njIb-W2eFu4ba3AQ8SBxEaNYt4CDcdFQ",
    #     "password": "123456"
    # }
    # "test4@ggpt.fun": {
    #     "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJ0ZXN0NEBnZ3B0LmZ1biIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS9hdXRoIjp7InBvaWQiOiJvcmctRXdLNVZIdmxETWxiREdMQXh2QlNycm9oIiwidXNlcl9pZCI6InVzZXItTXRpN0JyYkg0SDdqS3NmYlNhOVcwUzY1In0sImlzcyI6Imh0dHBzOi8vYXV0aDAub3BlbmFpLmNvbS8iLCJzdWIiOiJhdXRoMHw2NTg1YWQwMWVjMDU4NDRmZjU4MjA0OTkiLCJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSIsImh0dHBzOi8vb3BlbmFpLm9wZW5haS5hdXRoMGFwcC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzAzOTU1MzI4LCJleHAiOjE3MDQ4MTkzMjgsImF6cCI6IlRkSkljYmUxNldvVEh0Tjk1bnl5d2g1RTR5T282SXRHIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBtb2RlbC5yZWFkIG1vZGVsLnJlcXVlc3Qgb3JnYW5pemF0aW9uLnJlYWQgb3JnYW5pemF0aW9uLndyaXRlIG9mZmxpbmVfYWNjZXNzIn0.EAd0sf8uoO-5LbhXNvAgcN9zOUWVg273AvBKOP68L46o3dWNSYwFoXFAjV8TTt1SVW6JhVSF3JMO4g2guegGgtOLnaiSgkkZ9F1wY-wq0lhYwxOb4ZZ2fCoTEL3yaDT_-zuN1s0eF4LJMj2Lgcp27ArLH8G2fUb3EUvzk601KgjLZQwf2jETFtozKmKqo0IIr8Ku8YJmHMgQNDd_WA4cvQE2rCsppLHqM6zbneghRa9Ynu4d0oSNNqVgcPW8SJCP8Fk88RoSRz1zKJHjfHlmelw8tztUTZbimh2YLve5B48SAYcTUNkubfPPMsR_6n_AjOCah8LE7ZEt4qWrth0Tcg",
    #     "show_user_info": false,
    #     "shared": true
    # },
    # 丢弃原json中token字段以fk开头的键值对
    tokens = {k: v for k, v in tokens.items() if 'token' in v and not v['token'].startswith('fk')}

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
            if user.session_token is None and user.refresh_token is None:
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
    pandora_tools.fresh_setup()


# 同步数据至tokens.json
@main_bp.route('/sync')
@login_required
def sync():
    sync_pandora()
    flash('同步成功', 'success')
    return redirect(url_for('main.manage_users'))
