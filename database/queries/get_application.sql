SELECT
    a.app_id,
    a.request_amount,
    a.user_comment,
    CASE
        WHEN f.type = 1 AND f.course < 5
            THEN format('%d курс', f.course)
        WHEN f.type = 1 AND f.course >= 5
            THEN 'Магистратура'
        WHEN f.type = 2
            THEN d.depart
    END AS label,
    c.cat_name,
    ac.amount
FROM applications AS a
    LEFT JOIN applications_categories AS ac ON a.app_id = ac.app_id
    LEFT JOIN categories AS c ON ac.cat_id = c.cat_id
    LEFT JOIN fundings AS f ON a.fund_id = f.fund_id
    LEFT JOIN departments AS d ON f.depart_id = d.depart_id
WHERE a.user_id = ? AND a.app_id = ?;