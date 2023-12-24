import json
import os
import re
import secrets
import sqlite3

from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from flask import Flask, g, redirect, url_for
from flask_bootstrap import Bootstrap5
from flask_login import LoginManager
from flask_moment import Moment
from flask_apscheduler import APScheduler
from loguru import logger

from auth.auth import User

DATABASE = 'helper.db'

app = Flask(__name__)
Bootstrap5(app)
Moment().init_app(app)
# 生成随机的secret_key
app.secret_key = secrets.token_hex(16)
login_manager = LoginManager()
login_manager.init_app(app)


# 用户加载函数
@login_manager.user_loader
def load_user(userid):
    return User()


@login_manager.unauthorized_handler
def unauthorized():
    return redirect(url_for('auth.login'))


@app.context_processor
def context_api_prefix():
    return dict(api_prefix=app.config['proxy_api_prefix'])


def init_db():
    with app.app_context():
        db = connect_db()
        db.execute('''
            create table if not exists users
            (
                id            INTEGER
                    primary key autoincrement,
                email         TEXT not null,
                password      TEXT not null,
                session_token TEXT,
                access_token  TEXT,
                share_list    TEXT,
                create_time   datetime,
                update_time   datetime,
                shared        INT default 0
            )
        ''')
        db.commit()


def connect_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(os.path.join(app.config['pandora_path'], DATABASE))
        db.row_factory = sqlite3.Row
    return db


def query_db(query, args=(), one=False):
    # 查看g对象是否存在db属性，如果不存在则创建
    if not hasattr(g, 'db'):
        g.db = connect_db()
    cur = g.db.execute(query, args)
    rv = [dict((cur.description[idx][0], value)
               for idx, value in enumerate(row)) for row in cur.fetchall()]
    return (rv[0] if rv else None) if one else rv


@app.before_request
def before_request():
    g.db = connect_db()


@app.after_request
def after_request(result):
    if hasattr(g, 'db'):
        g.db.close()
    return result


def check_require_config():
    PANDORA_NEXT_PATH = os.getenv('PANDORA_NEXT_PATH')
    # 如果PANDORA_NEXT_PATH 为空则检查/data下是否存在config.json
    if PANDORA_NEXT_PATH is None:
        if os.path.exists('/data/config.json'):
            PANDORA_NEXT_PATH = '/data'
        else:
            logger.error("请配置PandoraNext相关环境变量")
            exit(1)
    PANDORA_NEXT_DOMAIN = os.getenv('PANDORA_NEXT_DOMAIN')
    if PANDORA_NEXT_DOMAIN is None:
        logger.error("请配置PandoraNext相关环境变量")
        exit(1)
    else:
        app.config.update(
            pandora_path=PANDORA_NEXT_PATH,
            pandora_domain=PANDORA_NEXT_DOMAIN
        )

    with open(os.path.join(PANDORA_NEXT_PATH, 'config.json'), 'r') as f:
        config = json.load(f)
        # 检查setup_password是否已经配置和密码强度
        # 密码强度要求：8-16位，包含数字、字母、特殊字符
        logger.info(config)
        if config['setup_password'] is None:
            logger.error('请先配置setup_password')
            exit(1)
        elif re.match(r'^(?=.*[a-zA-Z])(?=.*\d).{8,}$',
                      config['setup_password']) is None:
            logger.error('setup_password强度不符合要求，请重新配置')
            exit(1)
        app.config.update(setup_password=config['setup_password'])
        # 必须配置proxy_api_prefix,且不少于8位，同时包含字母和数字
        if config['proxy_api_prefix'] is None or re.match(r'^(?=.*[a-zA-Z])(?=.*\d).{8,}$',
                                                          config['proxy_api_prefix']) is None:
            logger.error('请配置proxy_api_prefix')
            exit(1)
        app.config.update(proxy_api_prefix=config['proxy_api_prefix'])
        # 检查验证码是否已经配置
        if config['captcha'] is None or config['captcha']['provider'] is None:
            logger.error('请配置hcaptcha验证码')
            exit(1)
        if config['captcha']['provider'] != 'hcaptcha':
            logger.error('不支持的验证码提供商')
            exit(1)
        else:
            app.config.update(
                license_id=config['license_id'],
                captcha_provider=config['captcha']['provider'],
                captcha_site_key=config['captcha']['site_key'],
                captcha_secret_key=config['captcha']['site_secret']
            )


from auth import auth
from main import main

check_require_config()
init_db()

#scheduler jobstore
app.config['SCHEDULER_JOBSTORES'] = {
    'default': SQLAlchemyJobStore(url='sqlite:///' + os.path.join(app.config['pandora_path'], DATABASE))
}
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()


def create_app():
    app.register_blueprint(auth.auth_bp, url_prefix='/' + app.config['proxy_api_prefix'])
    app.register_blueprint(main.main_bp, url_prefix='/' + app.config['proxy_api_prefix'])
    # 设置日志等级
    import logging
    logging.basicConfig()
    logging.getLogger('apscheduler').setLevel(logging.DEBUG)
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=False)
