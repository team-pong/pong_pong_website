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
    INSERT INTO dm_store VALUES (5, 'tester01', 'tester02', '1');
    INSERT INTO dm_store VALUES (6, 'tester01', 'tester02', '2');
    INSERT INTO dm_store VALUES (7, 'tester02', 'tester01', '3');
    INSERT INTO dm_store VALUES (8, 'tester01', 'tester02', '4');
    INSERT INTO dm_store VALUES (9, 'tester02', 'tester01', '5');
    INSERT INTO dm_store VALUES (10, 'hna', 'tester01', '1');
    INSERT INTO dm_store VALUES (11, 'tester01', 'hna', '2');
    INSERT INTO dm_store VALUES (12, 'tester02', 'tester01', '6');
    INSERT INTO dm_store VALUES (13, 'tester01', 'yochoi', '1');
    INSERT INTO dm_store VALUES (14, 'jinbkim', 'tester01', '1');
EOSQL