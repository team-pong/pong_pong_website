mkdir postgres
chown postgres:postgres postgres

# @brief postgres 디렉토리 초기화
# @todo 1. postgres 폴더가 비어있는 경우에만 아래 스크립트가 실행되도록 바꿔야함
initdb /db/postgres;
echo 'host    all             all             0.0.0.0/0               trust' >> /db/postgres/pg_hba.conf
pg_ctl -D /db/postgres -l logfile start;

psql <<- EOSQL
    CREATE USER $PG_PONG_ADMIN WITH PASSWORD '$PG_PONG_PW';
    CREATE DATABASE $PG_PONG_DB;
    GRANT ALL PRIVILEGES ON DATABASE $PG_PONG_DB TO $PG_PONG_ADMIN;
    CREATE USER pong_session_admin WITH PASSWORD '1234';
EOSQL