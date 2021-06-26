FROM postgres:13.3-alpine

# 리눅스 계정 변경, 권한 수정
RUN mkdir postgres
RUN chown postgres:postgres postgres

# DB 초기화: https://www.postgresql.org/docs/9.5/app-initdb.html
USER postgres
RUN initdb postgres

# DB 실행
WORKDIR /postgres
COPY ./init-user-db.sh /postgres/

# 관리자 계정 생성
# 관리저 권한 설정
EXPOSE 5432