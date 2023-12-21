from app import create_app
from waitress import serve

if __name__ == '__main__':
    serve(create_app(), host='0.0.0.0', port=8182)
