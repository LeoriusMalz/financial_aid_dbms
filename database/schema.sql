PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    user_id     BIGINT          PRIMARY KEY,
    name        VARCHAR(30)     NOT NULL,
    surname     VARCHAR(30)     NOT NULL,
    patronim    VARCHAR(30),
    phone       CHAR(18),
    tg_id       VARCHAR(12)     NOT NULL UNIQUE,
    tg_nick     VARCHAR(64)     UNIQUE,
    email       VARCHAR(48)     NOT NULL UNIQUE,
    is_active   BOOL            NOT NULL DEFAULT True,
    group_id    INTEGER,
    role_id     INTEGER         NOT NULL DEFAULT 1
--     FOREIGN KEY (group_id)  REFERENCES  groups(group_id)  ON DELETE SET NULL,
--     FOREIGN KEY (role_id)   REFERENCES  roles(role_id)      ON DELETE SET DEFAULT
);

CREATE TABLE IF NOT EXISTS groups (
    group_id    INTEGER         PRIMARY KEY,
    "group"     VARCHAR(10)     NOT NULL,
    year        INTEGER         NOT NULL CHECK(`year` > 2000)
);

CREATE TABLE IF NOT EXISTS roles (
    role_id     INTEGER         PRIMARY KEY,
    role        VARCHAR(30)     NOT NULL UNIQUE
);

-- 0 - бак, 1 - мага, 2 - спец
-- 01-19 - фш
-- 00-99 - год
-- 01-19 - группа
-- 0-9 - буква

-- М04-501а
-- 20121190
-- 00121100
-- 10425011