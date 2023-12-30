FROM python:3.9-slim-bookworm
WORKDIR /app
COPY . /app
ENV TZ Asia/Shanghai
RUN pip install -r requirements.txt --no-cache-dir -i https://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com
EXPOSE 8182
# 数据库初始化/升级
RUN flask db upgrade
# 启动waitress
ENTRYPOINT ["waitress-serve","--port", "8182", "--call","app:create_app"]