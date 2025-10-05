# Сервис сбора материальной помощи

## Таблицы

### `users`

| Поле | Тип данных | Ограничения | Описание |
|------|------------|-------------|-----------|
| `user_id` | `INT` | `PRIMARY KEY, AUTO_INCREMENT` | ID пользователя |
| `name` | `VARCHAR(50)` | `NOT NULL` | Имя пользователя |
| `surname` | `VARCHAR(50)` | `NOT NULL` | Фамилия пользователя |
| `patronim` | `VARCHAR(50)` |  | Отчество пользователя |
| `phone` | `CHAR(18)` | `NOT NULL` | Номер телефона |
| `tg_id` | `VARCHAR(12)` | `NOT NULL, UNIQUE` | Telegram ID |
| `tg_nick` | `VARCHAR(50)` | `UNIQUE` | Telegram nickname |
| `email` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | Учебная почта |
| `group_id` | `INT` | `NOT NULL` | ID группы |
| `role_id` | `INT` | `NOT NULL, DEFAULT 1` | ID роли |
| `depart_id` | `INT` | `DEFAULT NULL` | ID департамента |

### `groups`

| Поле | Тип данных | Ограничения | Описание |
|------|------------|-------------|-----------|
| `group_id` | `INT` | `PRIMARY KEY` | ID группы |
| `group` | `VARCHAR(10)` | `UNIQUE` | Номер группы |
| `year` | `INT` |  | Год поступления потока |

### `roles`

| Поле | Тип данных | Ограничения | Описание |
|------|------------|-------------|-----------|
| `role_id` | `INT` | `PRIMARY KEY` | ID роли |
| `role` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | Название роли |

Возможные значения:
- 1: студент
- 2: глава департамента
- 3: староста курса
- 4: начальник курса (староста своего курса и 1-го курса)
- 5: стипендиальная комиссия

### `departments`

| Поле | Тип данных | Ограничения | Описание |
|------|------------|-------------|-----------|
| `depart_id` | `INT` | `PRIMARY KEY` | ID департамента |
| `depart` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | Название департамента |

Возможные значения:
- 1: учебный департамент
- 2: информационный департамент
- 3: PR-департамент
- 4: хозяйственный департамент
- 5: ДКС (департамент культуры и спорта)

#### `users_departments`
(для связи таблиц `users` и `departments` "многие ко многим")

| Поле | Тип данных | Ограничения | Описание |
|------|------------|-------------|-----------|
| `user_id` | `INT` | `PRIMARY KEY` | ID пользователя |
| `depart_id` | `INT` | `PRIMARY KEY` | ID департамента |

---

### `applications`

| Поле | Тип данных | Ограничения | Описание |
|------|------------|-------------|-----------|
| `app_id` | `INT` | `PRIMARY KEY, AUTO_INCREMENT` | ID заявления |
| `user_id` | `INT` | `NOT_NULL` | ID пользователя |
| `request_amount` | `INT` | `NOT NULL, DEFAULT 0, CHECK (>= 0)` | Запрашиваемая сумма |
| `recomm_amount` | `INT` | `NOT NULL, CHECK (>= 0)` | Рекомендуемая сумма от старосты/главы |
| `final_amount` | `INT` | `NOT NULL, CHECK (>= 0)` | Итоговая сумма от комиссии |
| `user_comment` | `VARCHAR(100)` | `DEFAULT ""` | Комментарий пользователя |
| `head_comment` | `VARCHAR(100)` | `DEFAULT ""` | Комментарий старосты/главы |
| `approve` | `BOOL` | `DEFAULT False` | Одобрение заявления комиссией |
| `file` | `BLOB` | `NOT NULL` | Путь к файлу с заявлением |
| `fund_id` | `INT` | `NOT NULL` | ID сбора |
| `date` | `DATE` | `NOT NULL, DEFAULT (CURRENT_DATE)` | Дата подачи заявления |

### `categories`

| Поле | Тип данных | Ограничения | Описание |
|------|------------|-------------|-----------|
| `cat_id` | `INT` | `PRIMARY KEY, AUTO_INCREMENT` | ID категории |
| `cat_name` | `VARCHAR(30)` | `NOT NULL, UNIQUE` | Название категории |

#### `applications_categories`
(для связи таблиц `applications` и `categories` "многие ко многим")

| Поле | Тип данных | Ограничения | Описание |
|------|------------|-------------|-----------|
| `app_id` | `INT` | `PRIMARY KEY, AUTO_INCREMENT` | ID заявления |
| `cat_id` | `INT` | `PRIMARY KEY` | ID категории |
| `amount` | `INT` | `NOT NULL, DEFAULT 0, CHECK (>= 0)` | Запрашиваемая сумма по категории |

### `tags`

| Поле | Тип данных | Ограничения | Описание |
|------|------------|-------------|-----------|
| `tag_id` | `INT` | `PRIMARY KEY, AUTO_INCREMENT` | ID тега |
| `tag` | `VARCHAR(30)` | `NOT NULL, UNIQUE` | Название категории |
| `user_id` | `INT` |  | ID создателя метки |

#### `applications_tags`
(для связи таблиц `applications` и `tags` "многие ко многим")

| Поле | Тип данных | Ограничения | Описание |
|------|------------|-------------|-----------|
| `app_id` | `INT` | `PRIMARY KEY, AUTO_INCREMENT` | ID заявления |
| `tag_id` | `INT` | `PRIMARY KEY` | ID тега |
| `user_id` | `INT` | `NOT NULL` | ID установившего метку |

---

### `fundings`

| Поле | Тип данных | Ограничения | Описание |
|------|------------|-------------|-----------|
| `fund_id` | `INT` | `PRIMARY KEY, AUTO_INCREMENT` | ID сбора |
| `start_date` | `DATE` | `NOT NULL, DEFAULT DATE('now')` | Дата начала сбора |
| `end_date` | `DATE` | `NOT NULL, DEFAULT DATE('now', '+5 days'), CHECK (> start_date)` | Дата конца сбора |
| `user_id` | `INT` | `NOT NULL` | ID создавшего сбор |
| `table` | `BLOB` | `NOT NULL` | Путь к таблице с заявлениями |

