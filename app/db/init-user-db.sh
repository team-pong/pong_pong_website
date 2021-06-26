echo "host    all             all             0.0.0.0/0               trust" >> ./pg_hba.conf

pg_ctl -D . -l logfile start;

psql <<- EOSQL
    CREATE USER pong_admin WITH PASSWORD '1234';
    CREATE DATABASE pong_db;
    GRANT ALL PRIVILEGES ON DATABASE pong_db TO pong_admin;
EOSQL