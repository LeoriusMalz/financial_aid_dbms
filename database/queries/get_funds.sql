-- SELECT
--     f.fund_id,
--     f.start_date,
--     f.end_date,
--     g.year,
--     g."group",
--     d.depart,
--     r.role
-- FROM fundings AS f
--     LEFT JOIN users AS u ON f.creator_id = u.user_id
--     LEFT JOIN groups AS g ON u.group_id = g.group_id
--     LEFT JOIN roles AS r ON u.role_id = r.role_id
--     LEFT JOIN users_departments AS u2d ON u.user_id = u2d.user_id
--     LEFT JOIN departments AS d ON u2d.depart_id = d.depart_id
-- WHERE r.role = 'Староста курса' AND
--         (g.year = ? AND SUBSTR(g."group", 1, 1) = SUBSTR(?, 1, 1) OR
--         ABS(g.year - ?) = 4 AND SUBSTR(g."group", 1, 1) != SUBSTR(?, 1, 1) AND SUBSTR(?, 1, 1) != 'Б' AND SUBSTR(g."group", 1, 1) != 'Б') OR
--       r.role = 'Глава департамента' AND d.depart IN (
--           SELECT d.depart FROM
--                               users AS u
--                           LEFT JOIN users_departments AS u2d ON u.user_id = u2d.user_id
--                           LEFT JOIN departments AS d ON u2d.depart_id = d.depart_id
--           WHERE u.user_id = ?
--       )
-- GROUP BY f.fund_id;

WITH vars(stream, course, user_id) AS (
    SELECT ?, ?, ?
)

SELECT
    f.fund_id,
    f.start_date,
    f.end_date,
    u.name,
    u.surname,
    f.type,
    f.course,
    d.depart,
    f.creator_id
FROM fundings AS f
    LEFT JOIN users AS u ON f.creator_id = u.user_id
    LEFT JOIN departments AS d ON f.depart_id = d.depart_id
WHERE
    f.type = 1 AND (
        f.stream = (SELECT stream FROM vars) OR f.stream != (SELECT stream FROM vars) AND
        date(f.start_date, 'unixepoch', 'localtime') > date(format('%s-08-31', IF(strftime('%m', 'now') > 8, strftime('%Y', 'now'), strftime('%Y', 'now')-1)))
        AND (
            (SELECT course FROM vars) = 5 AND
            f.stream = (SELECT stream FROM vars)-1 OR
            (SELECT course FROM vars) = 6 AND
            f.stream = (SELECT stream FROM vars)+1)
    ) OR
    f.type = 2 AND f.depart_id IN (
        SELECT u2d.depart_id FROM
            users AS u
            LEFT JOIN users_departments AS u2d ON u.user_id = u2d.user_id
        WHERE u.user_id = (SELECT user_id FROM vars)
    ) OR
    f.creator_id = (SELECT user_id FROM vars)
ORDER BY f.end_date DESC, f.start_date DESC

-- SELECT date(1762981200, 'unixepoch', 'localtime') > date(format('%s-08-31', IF(strftime('%m', 'now') > 8, strftime('%Y', 'now'), strftime('%Y', 'now')-1)));

