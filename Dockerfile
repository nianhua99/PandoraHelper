FROM python:3.10-alpine
WORKDIR /app
COPY . /app
ENV TZ Asia/Shanghai
RUN pip install -r requirements.txt --no-cache-dir -i https://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com
EXPOSE 8182
# 启动waitress
#ENTRYPOINT ["python","app.py"]
ENTRYPOINT ["waitress-serve","--port", "8182", "--call","app:create_app"]