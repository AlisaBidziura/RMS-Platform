# RMS Platform (Robot Management System)

Прототип универсальной платформы для управления сервисными роботами.

## Как запустить проект локально

Проект разделен на две части: `frontend` (React) и `backend` (Python/FastAPI).

### 1. Запуск Бэкенда
1. Перейдите в папку бэкенда: `cd backend`
2. Создайте виртуальное окружение: `python -m venv .venv`
3. Активируйте его:
   - Windows: `.venv\Scripts\activate`
   - Mac/Linux: `source .venv/bin/activate`
4. Установите зависимости: `pip install -r requirements.txt`
5. Запустите сервер: `uvicorn main:app --reload`
*API будет доступно по адресу: http://127.0.0.1:8000/docs*

### 2. Запуск Фронтенда
1. Откройте **новый** терминал.
2. Перейдите в папку фронтенда: `cd frontend`
3. Установите зависимости: `npm install`
4. Запустите проект: `npm run dev`
*Интерфейс будет доступен по адресу: http://localhost:5173*

## Структура проекта
- `/frontend` — Клиентская часть (React, Vite)
- `/backend` — Серверная часть (Python, FastAPI, SQLAlchemy, SQLite)