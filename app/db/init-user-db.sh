mkdir postgres
chown postgres:postgres postgres

# @brief postgres 디렉토리 초기화
# @todo 1. postgres 폴더가 비어있는 경우에만 아래 스크립트가 실행되도록 바꿔야함
initdb /db/postgres;
pg_ctl -D /db/postgres -l logfile start;
echo 'host    all             all             0.0.0.0/0               trust' >> /db/postgres/pg_hba.conf

psql <<- EOSQL
    CREATE USER $PG_PONG_ADMIN WITH PASSWORD '$PG_PONG_PW';

    CREATE DATABASE $PG_PONG_DB;
    GRANT ALL PRIVILEGES ON DATABASE $PG_PONG_DB TO $PG_PONG_ADMIN;
		\c $PG_PONG_DB;

		CREATE TABLE users (user_id varchar(50) PRIMARY KEY, nick varchar(50), avatar_url varchar(50));
		CREATE TABLE achievements (user_id varchar(50), achievement varchar(50));
		CREATE TABLE match (winner_id varchar(50), loser_id varchar(50), type varchar(50));
		CREATE TABLE chat (channel_id varchar(50), owner_id varchar(50), type varchar(50), passwd varchar(50));
		CREATE TABLE stat (user_id varchar(50), games varchar(50), win_game varchar(50), loss_game varchar(50), ladder_level varchar(50));
		CREATE TABLE ban (channel_id varchar(50), user_id varchar(50));
		CREATE TABLE admin (channel_id varchar(50), user_id varchar(50));
		CREATE TABLE mute (channel_id varchar(50), user_id varchar(50));
		CREATE TABLE friend (user_id varchar(50), friend_id varchar(50), status varchar(50));

		GRANT ALL PRIVILEGES ON TABLE users TO $PG_PONG_ADMIN;
    GRANT ALL PRIVILEGES ON TABLE achivements TO $PG_PONG_ADMIN;
    GRANT ALL PRIVILEGES ON TABLE match TO $PG_PONG_ADMIN;
    GRANT ALL PRIVILEGES ON TABLE chat TO $PG_PONG_ADMIN;
    GRANT ALL PRIVILEGES ON TABLE stat TO $PG_PONG_ADMIN;
    GRANT ALL PRIVILEGES ON TABLE ban TO $PG_PONG_ADMIN;
    GRANT ALL PRIVILEGES ON TABLE admin TO $PG_PONG_ADMIN;
    GRANT ALL PRIVILEGES ON TABLE mute TO $PG_PONG_ADMIN;
    GRANT ALL PRIVILEGES ON TABLE friend TO $PG_PONG_ADMIN;
EOSQL

psql pong_db <<- EOSQL
    CREATE USER pong_session_admin WITH PASSWORD '1234';
    CREATE TABLE session (
      sid varchar NOT NULL COLLATE "default",
      sess json NOT NULL,
      expire timestamp(6) NOT NULL
    )
    WITH (OIDS=FALSE);
    ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
    CREATE INDEX IDX_session_expire ON session (expire);
    GRANT ALL PRIVILEGES ON TABLE session TO pong_session_admin;

    GRANT ALL PRIVILEGES ON TABLE session TO $PG_PONG_ADMIN;
EOSQL