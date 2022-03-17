# syntax=docker/dockerfile:1
FROM golang:1.17
COPY . /go/
WORKDIR /go/
RUN unset GOPATH
ENV GOPATH=
RUN go build -o api_server .
RUN chmod +x api_server
RUN cp api_server /usr/bin
CMD ["api_server"]
EXPOSE 8080