import asyncio
import random
from contextlib import asynccontextmanager, suppress
from datetime import datetime, timedelta, timezone

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from models import Base, Event, Robot, Task, utcnow
from schemas import (
    EventResponse,
    LoginRequest,
    LoginResponse,
    RobotResponse,
    TaskCreate,
    TaskResponse,
    TaskStatusUpdate,
)

DATABASE_URL = "sqlite+aiosqlite:///./rms.db"

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

ROBOT_STATUSES = {"working", "available", "charging", "warning", "offline"}
TASK_STATUSES = {"Ожидает", "В работе", "Требует внимания", "Завершена", "Отменена"}


async def get_db():
    async with SessionLocal() as session:
        yield session


def clock_time() -> str:
    return datetime.now().strftime("%H:%M")


def event_time() -> str:
    return datetime.now().strftime("%H:%M:%S")


async def add_event(
    db: AsyncSession, title: str, detail: str, tone: str = "info"
) -> None:
    db.add(Event(time=event_time(), title=title, detail=detail, tone=tone))
    # Keep the audit feed bounded.
    await db.flush()


async def seed_database() -> None:
    async with SessionLocal() as db:
        count = await db.scalar(select(func.count()).select_from(Robot))
        if count:
            return

        robots = [
            Robot(
                id="R-001", name="TransportBot-01", type="Транспортный",
                model="TB-200", battery=82, status="working", floor=2,
                task="Доставка расходных материалов",
            ),
            Robot(
                id="R-002", name="CleanBot-02", type="Уборочный",
                model="CB-100", battery=64, status="warning", floor=1,
                task=None,
            ),
            Robot(
                id="R-003", name="TransportBot-03", type="Транспортный",
                model="TB-200", battery=96, status="available", floor=3,
                task=None,
            ),
        ]
        db.add_all(robots)

        now = utcnow()
        db.add(
            Task(
                id="T-104",
                title="Доставка расходных материалов",
                kind="Доставка",
                robot_id="R-001",
                zone="Этаж 2 · Склад → Кабинет 204",
                status="В работе",
                priority="Высокий",
                time=clock_time(),
                created_at=now - timedelta(minutes=8),
                started_at=now - timedelta(minutes=7),
            )
        )
        db.add(
            Event(
                time=event_time(),
                title="CleanBot-02 требует внимания",
                detail="Проверка оборудования",
                tone="warning",
                created_at=now,
            )
        )
        await db.commit()


async def simulator_loop() -> None:
    """Check task timers every second and drain one random battery every 10 seconds."""
    battery_tick = 0
    while True:
        try:
            async with SessionLocal() as db:
                # A task starts 5 seconds after creation, then runs for 20 seconds.
                now = utcnow()
                waiting = (
                    await db.scalars(
                        select(Task).where(Task.status == "Ожидает")
                    )
                ).all()

                for task in waiting:
                    if now - task.created_at >= timedelta(seconds=5):
                        task.status = "В работе"
                        task.started_at = now
                        robot = await db.get(Robot, task.robot_id)
                        if robot:
                            robot.status = "working"
                            robot.task = task.title
                        await add_event(
                            db,
                            f"Задача {task.id} запущена",
                            f"{task.title} · робот {task.robot_id}",
                            "info",
                        )

                running = (
                    await db.scalars(
                        select(Task).where(
                            Task.status == "В работе",
                            Task.started_at.is_not(None),
                        )
                    )
                ).all()

                for task in running:
                    if task.started_at and now - task.started_at >= timedelta(seconds=20):
                        task.status = "Завершена"
                        robot = await db.get(Robot, task.robot_id)
                        if robot:
                            robot.status = "available"
                            robot.task = None
                        await add_event(
                            db,
                            f"Задача {task.id} завершена",
                            f"{task.title} · робот {task.robot_id}",
                            "success",
                        )

                await db.commit()

            battery_tick += 1
            if battery_tick >= 10:
                battery_tick = 0
                async with SessionLocal() as db:
                    robots = (
                        await db.scalars(
                            select(Robot).where(Robot.status != "offline")
                        )
                    ).all()
                    if robots:
                        robot = random.choice(robots)
                        robot.battery = max(0, robot.battery - 1)
                        if robot.battery == 0:
                            robot.status = "offline"
                            robot.task = None
                            await add_event(
                                db,
                                f"{robot.name} отключён",
                                "Уровень заряда достиг 0%",
                                "warning",
                            )
                        await db.commit()

            await asyncio.sleep(1)

        except asyncio.CancelledError:
            raise
        except Exception as exc:
            # Keep the simulator alive if one iteration fails.
            print(f"[simulator] Ошибка цикла: {exc}")
            await asyncio.sleep(2)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_database()
    simulator_task = asyncio.create_task(simulator_loop())
    yield
    simulator_task.cancel()
    with suppress(asyncio.CancelledError):
        await simulator_task
    await engine.dispose()


app = FastAPI(
    title="Robot Management System API",
    description="MVP API для управления парком роботов и задачами.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Robot Management System API", "docs": "/docs"}


@app.post("/api/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    # Demo authentication only. Replace with password verification and JWT in production.
    if not payload.login.strip() or not payload.password.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Логин и пароль не должны быть пустыми",
        )
    return {
        "user": "dispatcher",
        "role": "Диспетчер",
        "token": "fake-jwt-token",
    }


@app.get("/api/robots", response_model=list[RobotResponse])
async def get_robots(db: AsyncSession = Depends(get_db)):
    result = await db.scalars(select(Robot).order_by(Robot.id))
    return result.all()


@app.get("/api/robots/{robot_id}", response_model=RobotResponse)
async def get_robot(robot_id: str, db: AsyncSession = Depends(get_db)):
    robot = await db.get(Robot, robot_id)
    if not robot:
        raise HTTPException(status_code=404, detail="Робот не найден")
    return robot


@app.get("/api/tasks", response_model=list[TaskResponse])
async def get_tasks(db: AsyncSession = Depends(get_db)):
    result = await db.scalars(select(Task).order_by(desc(Task.created_at)))
    return [
        {
            "id": task.id,
            "title": task.title,
            "kind": task.kind,
            "robotId": task.robot_id,
            "zone": task.zone,
            "status": task.status,
            "priority": task.priority,
            "time": task.time,
        }
        for task in result.all()
    ]


@app.post(
    "/api/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_task(payload: TaskCreate, db: AsyncSession = Depends(get_db)):
    robot = await db.get(Robot, payload.robotId)
    if not robot:
        raise HTTPException(status_code=404, detail="Робот не найден")

    existing_ids = (await db.scalars(select(Task.id))).all()
    numeric_ids = [int(value[2:]) for value in existing_ids if value.startswith("T-") and value[2:].isdigit()]
    # IDs follow the same human-readable pattern as the frontend mock data.
    next_number = max([104, *numeric_ids]) + 1
    task = Task(
        id=f"T-{next_number}",
        title=payload.title,
        kind=payload.kind,
        robot_id=payload.robotId,
        zone=payload.zone,
        status="Ожидает",
        priority=payload.priority,
        time=clock_time(),
        created_at=utcnow(),
    )
    db.add(task)
    await add_event(
        db,
        "Создана новая задача",
        f"{task.title} · робот {task.robot_id}",
        "info",
    )
    await db.commit()
    return {
        "id": task.id,
        "title": task.title,
        "kind": task.kind,
        "robotId": task.robot_id,
        "zone": task.zone,
        "status": task.status,
        "priority": task.priority,
        "time": task.time,
    }


@app.patch("/api/tasks/{task_id}", response_model=TaskResponse)
async def update_task_status(
    task_id: str,
    payload: TaskStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    if payload.status not in TASK_STATUSES:
        raise HTTPException(
            status_code=422,
            detail=f"Недопустимый статус. Допустимые значения: {sorted(TASK_STATUSES)}",
        )

    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")

    previous_status = task.status
    task.status = payload.status
    robot = await db.get(Robot, task.robot_id)

    if robot:
        if payload.status == "В работе":
            robot.status = "working"
            robot.task = task.title
            task.started_at = utcnow()
        elif payload.status in {"Завершена", "Отменена"}:
            robot.status = "available"
            robot.task = None
        elif payload.status == "Ожидает":
            task.started_at = None

    if previous_status != payload.status:
        tone = "success" if payload.status == "Завершена" else "info"
        await add_event(
            db,
            f"Изменён статус задачи {task.id}",
            f"{previous_status} → {payload.status}",
            tone,
        )

    await db.commit()
    return {
        "id": task.id,
        "title": task.title,
        "kind": task.kind,
        "robotId": task.robot_id,
        "zone": task.zone,
        "status": task.status,
        "priority": task.priority,
        "time": task.time,
    }


@app.get("/api/events", response_model=list[EventResponse])
async def get_events(db: AsyncSession = Depends(get_db)):
    result = await db.scalars(
        select(Event).order_by(desc(Event.created_at), desc(Event.id)).limit(50)
    )
    # Frontend contract intentionally exposes only these four fields.
    return [
        {
            "time": event.time,
            "title": event.title,
            "detail": event.detail,
            "tone": event.tone,
        }
        for event in result.all()
    ]
