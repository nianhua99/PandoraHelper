import json

import requests
from flask import render_template, redirect, url_for, request, flash, current_app, Blueprint, jsonify
from flask_login import login_required, UserMixin, logout_user, login_user
from flask_wtf import FlaskForm
from wtforms.fields.simple import PasswordField
from wtforms.validators import DataRequired
from flask_jwt_extended import create_access_token

from util.api_response import ApiResponse

auth_bp = Blueprint("auth", __name__)


def validate_hcaptcha_response(response):
    secret_key = current_app.config['captcha_secret_key']
    verify_url = "https://api.hcaptcha.com/siteverify"
    payload = {
        'secret': secret_key,
        'response': response
    }
    r = requests.post(verify_url, data=payload)
    result = r.json()
    return result['success']


class LoginForm(FlaskForm):
    password = PasswordField('Password', validators=[DataRequired()])


class User(UserMixin):
    id = 1


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    site_key = current_app.config['captcha_site_key']
    if request.method == 'POST':
        if form.validate_on_submit():
            password = form.password.data
            hcaptcha_response = request.form.get('h-captcha-response')
            if hcaptcha_response is None:
                flash('Captcha is Required', 'error')
                return render_template('login.html', form=form, site_key=site_key)
            if not validate_hcaptcha_response(hcaptcha_response):
                flash('Captcha is failed', 'error')
                return render_template('login.html', form=form, site_key=site_key)
            if password == current_app.config['setup_password']:  # 检查密码是否正确
                user = User()
                login_user(user)
                return redirect(url_for('main.manage_users'))
            else:
                flash('login failed！', 'error')
    return render_template('login.html', form=form, site_key=site_key)


# 登出路由
@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))


@auth_bp.route('/login2', methods=['POST'])
# 使用Jwt登录
def login2():
    password = request.json.get('password')
    print(password)
    print(current_app.config['setup_password'])
    if password == current_app.config['setup_password']:
        access_token = create_access_token(identity='admin')
        return ApiResponse.success(data={'access_token': access_token})
    else:
        return ApiResponse.error('login failed！', 401)
