import json
import os
import re
import secrets
from datetime import date, datetime

from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from flask import Flask, redirect, url_for
from flask.json.provider import JSONProvider
from flask_bootstrap import Bootstrap5
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_moment import Moment
from flask_apscheduler import APScheduler
from loguru import logger
from flask_jwt_extended import JWTManager

import account
from auth.auth import User

DATABASE = 'helper.db'

app = Flask(__name__)
Bootstrap5(app)
Moment().init_app(app)
# 生成随机的secret_key
app.secret_key = secrets.token_hex(16)
login_manager = LoginManager()
login_manager.init_app(app)
app.config["JWT_SECRET_KEY"] = secrets.token_hex(16)
jwt = JWTManager(app)


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
from model import db

check_require_config()

# scheduler jobstore
app.config['SCHEDULER_JOBSTORES'] = {
    'default': SQLAlchemyJobStore(url='sqlite:///' + os.path.join(app.config['pandora_path'], DATABASE))
}
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.config['pandora_path'], DATABASE)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db.init_app(app)


def include_object(object, name, type_, reflected, compare_to):
    if (
            type_ == "table" and name == "apscheduler_jobs"
    ):
        return False
    else:
        return True


migrate = Migrate(include_object=include_object)
migrate.init_app(app, db)


def format_datetime(value):
    """Format a datetime to a string."""
    if value is None:
        return ""
    return value.strftime('%Y-%m-%d %H:%M:%S')


class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(o, date):
            return o.strftime('%Y-%m-%d')
        elif hasattr(o, 'keys') and hasattr(o, '__getitem__'):
            return dict(o)
        raise TypeError(f'Object of type {o.__class__.__name__} '
                        f'is not JSON serializable')


class StandardJSONProvider(JSONProvider):
    def dumps(self, obj, **kwargs):
        # 使用自定义的JSON编码器进行序列化
        return json.dumps(obj, cls=JSONEncoder, **kwargs)

    def loads(self, s, **kwargs):
        return json.loads(s, **kwargs)


app.json = StandardJSONProvider(app)


def create_app():
    app.register_blueprint(auth.auth_bp, url_prefix='/' + app.config['proxy_api_prefix'])
    app.register_blueprint(main.main_bp, url_prefix='/' + app.config['proxy_api_prefix'])
    app.register_blueprint(account.account_bp, url_prefix='/' + app.config['proxy_api_prefix'] + '/account')
    app.jinja_env.filters['datetime'] = format_datetime
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
