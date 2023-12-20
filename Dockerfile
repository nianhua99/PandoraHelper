FROM python:3.10-alpine
WORKDIR /app
COPY . /app
ENV TZ Asia/Shanghai
RUN pip install -r requirements.txt --no-cache-dir -i https://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com
EXPOSE 8080
# 启动waitress
#ENTRYPOINT ["python","app.py"]
ENTRYPOINT ["waitress-serve","--call","app:create_app"]