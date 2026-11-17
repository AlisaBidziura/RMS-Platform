# Robot Management System (RMS) — Backend MVP

Backend для MVP системы управления роботами. Стек: Python 3.11+, FastAPI,
SQLAlchemy 2.x (async), SQLite.

## 1. Установка

Проверьте версию Python:

```bash
python --version
```

Создайте виртуальное окружение (рекомендуется):

**Windows:**
```powershell
py -3.11 -m venv .venv
.venv\Scripts\activate
```

**macOS / Linux:**
```bash
python3.11 -m venv .venv
source .venv/bin/activate
```

Установите зависимости:

```bash
pip install -r requirements.txt
```

## 2. Запуск

Из папки проекта выполните:

```bash
uvicorn main:app --reload
```

API будет доступно по адресу http://localhost:8000.

Интерактивная документация Swagger: http://localhost:8000/docs

При первом запуске автоматически создаётся файл `rms.db` и добавляются
демонстрационные роботы, задача и событие. При последующих запусках данные
сохраняются. Чтобы начать с чистой базы, остановите сервер и удалите `rms.db`.

## 3. API

| Метод | Путь | Назначение |
|---|---|---|
| POST | `/api/login` | Демо-аутентификация |
| GET | `/api/robots` | Все роботы |
| GET | `/api/robots/{id}` | Один робот |
| GET | `/api/tasks` | Все задачи |
| POST | `/api/tasks` | Создать задачу |
| PATCH | `/api/tasks/{id}` | Изменить статус задачи |
| GET | `/api/events` | Последние 50 событий |

### Примеры запросов

**Вход:**
```json
{
  "login": "dispatcher",
  "password": "12345"
}
```

**Создание задачи:**
```json
{
  "title": "Доставка документов",
  "kind": "Доставка",
  "robotId": "R-003",
  "zone": "Этаж 3 · Ресепшен → Кабинет 305"
}
```

Поле `priority` необязательно, по умолчанию — `"Средний"`.

**Изменение статуса:**
```json
{
  "status": "В работе"
}
```

## 4. Формат данных

API возвращает совместимые с React-моками поля:

- Робот: `id`, `name`, `type`, `model`, `battery`, `status`, `floor`, `task`.
- Задача: `id`, `title`, `kind`, `robotId`, `zone`, `status`, `priority`, `time`.
- Событие: `time`, `title`, `detail`, `tone`.

`robotId` сохраняется в JSON именно в camelCase, хотя в Python-модели
используется атрибут `robot_id`.

## 5. Подключение React

Пример:

```javascript
const API_URL = "http://localhost:8000";

const response = await fetch(`${API_URL}/api/robots`);
const robots = await response.json();
```

Для создания задачи:

```javascript
const response = await fetch(`${API_URL}/api/tasks`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Доставка документов",
    kind: "Доставка",
    robotId: "R-003",
    zone: "Этаж 3 · Ресепшен → Кабинет 305"
  })
});
```

CORS разрешает запросы с `http://localhost:5173` и
`http://127.0.0.1:5173`.

