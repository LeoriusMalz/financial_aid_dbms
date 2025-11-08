PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users(
    user_id     BIGINT          PRIMARY KEY,
    name        VARCHAR(30)     NOT NULL,
    surname     VARCHAR(30)     NOT NULL,
    patronym    VARCHAR(30),
    phone       CHAR(18),
    tg_id       VARCHAR(12)     UNIQUE,
    tg_nick     VARCHAR(64),
    email       VARCHAR(48)     NOT NULL UNIQUE,
    is_active   BOOL            NOT NULL DEFAULT True,
    group_id    INTEGER,
    role_id     INTEGER         NOT NULL DEFAULT 1,
    FOREIGN KEY (group_id)  REFERENCES  groups(group_id) ON DELETE SET NULL
                                                         ON UPDATE CASCADE,
    FOREIGN KEY (role_id)   REFERENCES  roles(role_id)   ON DELETE SET DEFAULT
                                                         ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS groups (
    group_id    INTEGER         PRIMARY KEY,
    "group"     VARCHAR(10)     NOT NULL,
    year        INTEGER         NOT NULL CHECK(year > 2000)
);

CREATE TABLE IF NOT EXISTS roles (
    role_id     INTEGER         PRIMARY KEY,
    role        VARCHAR(30)     NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users_departments (
    user_id     BIGINT,
    depart_id   INTEGER,
    PRIMARY KEY (user_id, depart_id),
    FOREIGN KEY (user_id)   REFERENCES  users(user_id)          ON DELETE CASCADE
                                                                ON UPDATE CASCADE,
    FOREIGN KEY (depart_id) REFERENCES  departments(depart_id)  ON DELETE CASCADE
                                                                ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS departments (
    depart_id   INTEGER         PRIMARY KEY,
    depart      VARCHAR(20)     NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS fundings (
    fund_id     INTEGER         PRIMARY KEY AUTOINCREMENT,
    start_date  DATE            NOT NULL DEFAULT CURRENT_DATE,
    end_date    DATE            NOT NULL CHECK(end_date > start_date),
    creator_id  BIGINT          NOT NULL,
    type        INTEGER         NOT NULL DEFAULT 1,
    course      INTEGER,
    depart_id   INTEGER,
    table_file  BLOB,
    FOREIGN KEY (depart_id) REFERENCES  departments(depart_id)  ON DELETE SET NULL
                                                                ON UPDATE CASCADE
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