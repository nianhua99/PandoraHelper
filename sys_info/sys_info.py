from flask import Blueprint, current_app
from flask_jwt_extended import jwt_required
from loguru import logger

from util import pandora_tools
from util.api_response import ApiResponse

sys_info_bp = Blueprint('sys_info_bp', __name__)


@sys_info_bp.route('/usage', methods=['GET'])
@jwt_required()
def get_usage():
    """Get usage of the system."""
    logger.info('Get system usage.')
    return ApiResponse.success(pandora_tools.get_balance())


@sys_info_bp.route('/info', methods=['GET'])
def get_info():
    """Get system info."""
    return ApiResponse.success({
        'captcha_site_key': current_app.config['captcha_site_key'] if current_app.config['captcha_enabled'] else '',
    })
