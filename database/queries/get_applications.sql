SELECT
    a.app_id,
    f.fund_id,
    strftime('%d.%m', a.date),
    strftime('%m', date(f.end_date, 'unixepoch', 'localtime')),
    f.type,
    f.course,
    d.depart,
    a.approve
FROM applications AS a
    LEFT JOIN fundings AS f ON a.fund_id = f.fund_id
    LEFT JOIN departments AS d ON f.depart_id = d.depart_id
WHERE a.user_id = ?;