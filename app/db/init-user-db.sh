echo "host    all             all             0.0.0.0/0               trust" >> ./pg_hba.conf

pg_ctl -D . -l logfile start;

psql <<- EOSQL
    CREATE USER $PG_PONG_ADMIN WITH PASSWORD '$PG_PONG_PW';
    CREATE DATABASE $PG_PONG_DB;
    GRANT ALL PRIVILEGES ON DATABASE $PG_PONG_DB TO $PG_PONG_ADMIN;
		\c $PG_PONG_DB;
		CREATE TABLE users (user_id varchar(50), user_image_url varchar(50));
		GRANT ALL PRIVILEGES ON TABLE users TO $PG_PONG_ADMIN;
EOSQL