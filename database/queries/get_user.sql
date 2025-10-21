SELECT
    u.name,
    u.surname,
    u.patronim,
    u.phone,
    u.tg_nick,
    u.email,
    u.is_active,
    g.'group',
    g.year,
    r.role
FROM users AS u
    LEFT JOIN groups AS g ON u.group_id = g.group_id
    LEFT JOIN roles AS r ON u.role_id = r.role_id
WHERE u.user_id = ?;