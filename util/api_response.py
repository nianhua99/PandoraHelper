from flask import current_app, jsonify


class ApiResponse:

    @staticmethod
    def success(data):
        return jsonify({
            'status': 0,
            'message': '请求成功',
            'data': data
        })

    @staticmethod
    def error(message, status=-1):
        return jsonify({
            'status': status,
            'message': message
        }), 500

    @staticmethod
    def unauthorized(message):
        return jsonify({
            'status': 444,
            'message': message
        }), 444
