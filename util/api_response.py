from flask import current_app, jsonify


class ApiResponse:

    @staticmethod
    def success(data):
        current_app.json
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
        }), status
