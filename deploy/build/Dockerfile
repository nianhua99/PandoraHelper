FROM alpine:latest
WORKDIR /app
ARG VERSION
COPY ../../builds/PandoraHelper-${VERSION}-linux-amd64/PandoraHelper /app/PandoraHelper
CMD ["/app/PandoraHelper"]