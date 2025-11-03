INSERT INTO users
    (user_id, name, surname, patronym, email) VALUES
    (?, ?, ?, ?, ?)
ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id;