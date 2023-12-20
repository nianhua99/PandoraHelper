import json
from datetime import datetime
from loguru import logger

from flask import Blueprint, render_template, request, redirect, url_for, g, flash, jsonify
from flask_login import login_required

import login_tools
import share_tools
import pandora_tools
from app import scheduler

main_bp = Blueprint('main', __name__)


@main_bp.route('/manage-users')
@login_required
def manage_users():
    from app import query_db
    users = query_db("select * from users")
    # 将share_list转换为json对象
    for user in users:
        user['share_list'] = json.loads(user['share_list'])
    job_started = scheduler.get_job(id='my_job') is not None

    return render_template('manage_users.html',
                           users=users, job_started=job_started, balance=pandora_tools.get_balance())


@main_bp.route('/add-user', methods=['POST'])
@login_required
def add_user():
    email = request.form['email']
    password = request.form['password']
    if 'shared' in request.form:
        shared = 1 if request.form['shared'] == 'on' else 0
    else:
        shared = 0
    g.db.execute('insert into users (email, password, shared, share_list, create_time, update_time) values (?, ?, ?, '
                 '?, ?, ?)',
                 [email, password, shared, '[]', datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                  datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
    g.db.commit()
    return redirect(url_for('main.manage_users'))


@main_bp.route('/delete-user/<int:user_id>')
@login_required
def delete_user(user_id):
    g.db.execute('delete from users where id = ?', [user_id])
    g.db.commit()
    return redirect(url_for('main.manage_users'))


@main_bp.route('/add-share', methods=['POST'])
@login_required
def add_share():
    from app import query_db
    user_id = request.form.get('user_id')
    unique_name = request.form.get('unique_name')
    password = request.form.get('password')
    user = query_db('select * from users where id = ?', one=True, args=(user_id,))
    try:
        share_token = share_tools.get_share_token(user['access_token'], unique_name)
    except Exception as e:
        flash('添加失败: ' + str(e), 'error')
        return redirect(url_for('main.manage_users'))
    share_list = json.loads(user['share_list'])
    # 检查是否已经存在
    for share in share_list:
        if share['unique_name'] == unique_name:
            # 删除原有的share_token
            share_list.remove(share)
    share_list.append({'unique_name': unique_name, 'password': password, 'share_token': share_token['token_key']})
    g.db.execute(
        f"UPDATE users SET share_list = '{json.dumps(share_list)}',update_time = '{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}' WHERE id = {user_id}")
    g.db.commit()
    flash('添加成功', 'success')
    return redirect(url_for('main.manage_users'))


@main_bp.route('/delete-share/<int:user_id>/<unique_name>')
@login_required
def delete_share(user_id, unique_name):
    from app import query_db
    user = query_db('select * from users where id = ?', one=True, args=(user_id,))
    share_list = json.loads(user['share_list'])
    for share in share_list:
        if share['unique_name'] == unique_name:
            share_list.remove(share)
            break
    g.db.execute(
        f"UPDATE users SET share_list = '{json.dumps(share_list)}',update_time = '{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}' WHERE id = {user_id}")
    g.db.commit()
    share_tools.get_share_token(user['access_token'], unique_name, expires_in=-1)
    flash('删除成功', 'success')
    return redirect(url_for('main.manage_users'))


def refresh(user_id):
    from app import query_db
    user = query_db('select * from users where id = ?', one=True, args=(user_id,))
    if user is None:
        return redirect(url_for('main.manage_users'))
    # 获取access_token
    if user['session_token'] is None:
        # 登录获取session_token 扣额度
        try:
            login_result = login_tools.login(user['email'], user['password'])
        except Exception as e:
            raise e
        access_token = login_result['access_token']
        session_token = login_result['session_token']
    else:
        # 使用session_token 刷新access_token
        try:
            access_token_result = login_tools.get_access_token(user['session_token'])
        except Exception as e:
            raise e
        access_token = access_token_result['access_token']
        session_token = access_token_result['session_token']
    # 更新session_token 和 access_token
    g.db.execute(
        f"UPDATE users SET session_token = '{session_token}',access_token = '{access_token}',update_time = '{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}' WHERE id = {user['id']}")
    g.db.commit()
    # 刷新share_token
    share_list = json.loads(user['share_list'])
    if len(share_list) == 0:
        # 没有share token，直接返回
        return redirect(url_for('main.manage_users'))
    for share in share_list:
        try:
            share_token = share_tools.get_share_token(access_token, share['unique_name'])
        except Exception as e:
            # 返回刷新失败
            raise e
        share['share_token'] = share_token['token_key']
    # 更新share_list
    g.db.execute(
        f"UPDATE users SET share_list = '{json.dumps(share_list)}',update_time = '{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}' WHERE id = {user['id']}")
    g.db.commit()


def refresh_all_user():
    from app import query_db
    users = query_db('select * from users')
    for user in users:
        try:
            # jwt解析access_token 检查access_token是否过期
            if 'access_token' not in user or user['access_token'] is None:
                continue
            else:
                token_info = pandora_tools.get_email_by_jwt(user['access_token'])
                # 根据exp判断是否过期,如果过期则刷新
                exp_time = datetime.fromtimestamp(token_info['exp'])
                if exp_time > datetime.now():
                    continue
            refresh(user['user_id'])
        except Exception as e:
            logger.error(e)
    sync()
    pandora_tools.fresh_setup()


@main_bp.route('/start_timer')
@login_required
def refresh_task():
    scheduler.add_job(func=refresh_all_user, trigger='interval', minutes=1, id='my_job')
    return redirect(url_for('main.manage_users'))


@main_bp.route('/kill_timer')
@login_required
def kill_refresh_task():
    scheduler.remove_job(func=refresh_all_user, trigger='interval', days=7, id='my_job')
    return redirect(url_for('main.manage_users'))


@main_bp.route('/refresh/<int:user_id>')
@login_required
def refresh_route(user_id):
    try:
        refresh(user_id)
        sync()
        pandora_tools.fresh_setup()
    except Exception as e:
        return jsonify({'code': 500, 'msg': '刷新失败: ' + str(e)}), 500
    return redirect(url_for('main.manage_users'))


# 同步数据至tokens.json
@main_bp.route('/sync')
@login_required
def sync():
    from app import query_db
    users = query_db("select * from users")
    tokens = {}
    # 将share_list转换为json对象
    for user in users:
        # 当存在share_list时, 取所有share_token, 并写入tokens.json
        if user['share_list'] is not None and user['share_list'] != '[]':
            share_list = json.loads(user['share_list'])
            for share in share_list:
                # json中有share_token和password才写入
                if 'share_token' in share and 'password' in share:
                    tokens[share['unique_name']] = {
                        'token': share['share_token'],
                        'password': share['password']
                    }
        else:
            if user['session_token'] is None:
                continue
            # 当不存在share_list时, 取session_token, 并写入tokens.json
            # Todo 自定义 plus / show_user_info
            tokens[user['email']] = {
                'token': user['access_token'],
                # Todo 自定义
                'show_user_info': False,
            }
            if user['shared'] == 1:
                tokens[user['email']]['shared'] = True
            else:
                tokens[user['email']]['shared'] = False
                tokens[user['email']]['password'] = user['password']
    # 检测当前是否存在tokens.json,如果有则备份,文件名为tokens.json + 当前时间
    import os
    if os.path.exists('tokens.json'):
        import time
        os.rename('tokens.json', 'tokens.json.' + time.strftime("%Y%m%d%H%M%S", time.localtime()))
    from flask import current_app
    # 将数据写入tokens.json
    with open(os.path.join(current_app.config['pandora_path'], 'tokens.json'), 'w') as f:
        # 美化json
        f.write(json.dumps(tokens, indent=4))
    flash('同步成功', 'success')
    return redirect(url_for('main.manage_users'))
