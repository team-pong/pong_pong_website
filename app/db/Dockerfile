FROM postgres:13.3-alpine

# 리눅스 계정 변경, 권한 수정
RUN mkdir postgres
RUN chown postgres:postgres postgres

# DB 초기화: https://www.postgresql.org/docs/9.5/app-initdb.html
USER postgres
RUN initdb postgres

# DB 설정 (IP 열어주기, postgres 실행, PONG_DB 및 관리자 생성)
WORKDIR /postgres
COPY ./init-user-db.sh /postgres/

EXPOSE 5432