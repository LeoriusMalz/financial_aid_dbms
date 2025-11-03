SELECT
    d.depart
FROM users AS u
    LEFT JOIN users_departments AS u2d ON u.user_id = u2d.user_id
    LEFT JOIN departments AS d ON u2d.depart_id = d.depart_id
WHERE u.user_id = ?;