import asyncio
import random
import re
from contextlib import asynccontextmanager, suppress
from datetime import datetime
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    Header,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
)

from models import Base, User, Robot, Task, Event
from schemas import (
    LoginRequest,
    LoginResponse,
    RobotResponse,
    TaskCreate,
    TaskStatusUpdate,
    TaskResponse,
    EventResponse,
)

DATABASE_URL = "sqlite+aiosqlite:///./rms.db"

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)

SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

FAKE_TOKEN = "fake-token"

ROBOT_STATUSES = {
    "working",
    "available",
    "charging",
    "warning",
    "offline",
}

TASK_STATUSES = {
    "Ожидает",
    "В работе",
    "Требует внимания",
    "Завершена",
    "Отменена",
}


def current_time():
    return datetime.now()


def format_time():
    return current_time().strftime("%H:%M")


def format_event_time():
    return current_time().strftime("%H:%M:%S")


async def get_db():
    async with SessionLocal() as db:
        yield db



security = HTTPBearer()

async def require_auth(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if credentials.credentials != FAKE_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return True


class ConnectionManager:

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(
            f"[WS] Client connected. "
            f"Total: {len(self.active_connections)}"
        )

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

        print(
            f"[WS] Client disconnected. "
            f"Total: {len(self.active_connections)}"
        )

    async def broadcast(self, message: dict):
        disconnected = []

        for connection in self.active_connections.copy():
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)

        for connection in disconnected:
            self.disconnect(connection)


manager = ConnectionManager()


async def create_event(
    db: AsyncSession,
    title: str,
    detail: str,
    tone: str = "info",
):
    event = Event(
        time=format_event_time(),
        title=title,
        detail=detail,
        tone=tone,
    )

    db.add(event)
    await db.flush()

    return event


def robot_to_dict(robot: Robot):
    return {
        "id": robot.id,
        "name": robot.name,
        "type": robot.type,
        "model": robot.model,
        "battery": robot.battery,
        "status": robot.status,
        "floor": robot.floor,
        "task": robot.task,
    }


def task_to_dict(task: Task):
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


async def initialize_database():

    async with SessionLocal() as db:

        result = await db.execute(select(Robot.id))
        existing_robots = result.scalars().all()

        if existing_robots:
            return

        now = current_time()

        robots = [
            Robot(
                id="R-001",
                name="TransportBot-01",
                type="Транспортный",
                model="TB-200",
                battery=82,
                status="working",
                floor=2,
                task="Доставка расходных материалов",
            ),
            Robot(
                id="R-002",
                name="CleanBot-02",
                type="Уборочный",
                model="CB-100",
                battery=64,
                status="warning",
                floor=1,
                task=None,
            ),
            Robot(
                id="R-003",
                name="TransportBot-03",
                type="Транспортный",
                model="TB-200",
                battery=96,
                status="available",
                floor=3,
                task=None,
            ),
            Robot(
                id="R-004",
                name="DeliveryBot-04",
                type="Доставочный",
                model="DB-300",
                battery=45,
                status="available",
                floor=2,
                task=None,
            ),
            Robot(
                id="R-005",
                name="CleanBot-05",
                type="Уборочный",
                model="CB-100",
                battery=91,
                status="charging",
                floor=1,
                task=None,
            ),
        ]

        db.add_all(robots)

        initial_task = Task(
            id="T-104",
            title="Доставка расходных материалов",
            kind="Доставка",
            robot_id="R-001",
            zone="Этаж 2 · Склад → Кабинет 204",
            status="В работе",
            priority="Высокий",
            time=format_time(),
            created_at=now,
            started_at=now,
        )

        db.add(initial_task)

        await create_event(
            db,
            "Система RMS запущена",
            "Все подсистемы работают в штатном режиме",
            "success",
        )

        await create_event(
            db,
            "CleanBot-02 требует внимания",
            "Проверка оборудования",
            "warning",
        )

        await db.commit()

        print("[DB] Initial data created")

async def simulator_loop():

    tick = 0

    print("[SIMULATOR] Started")

    while True:

        try:

            async with SessionLocal() as db:

                now = current_time()

                # 1. TASK START

                waiting_tasks = (
                    await db.scalars(
                        select(Task).where(
                            Task.status == "Ожидает"
                        )
                    )
                ).all()

                for task in waiting_tasks:

                    if now - task.created_at < timedelta_seconds(10):
                        continue

                    robot = await db.get(Robot, task.robot_id)

                    if not robot or robot.status != "available":
                        continue

                    task.status = "В работе"
                    task.started_at = now

                    robot.status = "working"
                    robot.task = task.title

                    await create_event(
                        db,
                        f"Задача {task.id} запущена",
                        f"{task.title} · робот {robot.name}",
                        "info",
                    )

                    print(f"[SIMULATOR] Task {task.id}: started")

                # 2. TASK COMPLETION

                running_tasks = (
                    await db.scalars(
                        select(Task).where(
                            Task.status == "В работе"
                        )
                    )
                ).all()

                for task in running_tasks:

                    if task.started_at is None:
                        continue

                    if now - task.started_at < timedelta_seconds(20):
                        continue

                    robot = await db.get(Robot, task.robot_id)

                    # Do not complete a task while its robot is charging.
                    if not robot or robot.status != "working":
                        continue

                    task.status = "Завершена"

                    robot.status = "available"
                    robot.task = None

                    await create_event(
                        db,
                        f"Задача {task.id} завершена",
                        f"{task.title} · робот {robot.name}",
                        "success",
                    )

                    print(f"[SIMULATOR] Task {task.id}: completed")

                # 3. BATTERY MANAGEMENT
                # Every 10 seconds

                if tick > 0 and tick % 10 == 0:

                    robots = (
                        await db.scalars(select(Robot))
                    ).all()

                    for robot in robots:

                        # WORKING: battery decreases by 1%
                        if robot.status == "working":

                            robot.battery = max(
                                0,
                                robot.battery - 1,
                            )

                            if robot.battery < 20:

                                robot.status = "charging"

                                await create_event(
                                    db,
                                    f"{robot.name} отправлен на зарядку",
                                    f"Заряд батареи: {robot.battery}%",
                                    "warning",
                                )

                                # Pause the current task.
                                active_tasks = (
                                    await db.scalars(
                                        select(Task).where(
                                            Task.robot_id == robot.id,
                                            Task.status == "В работе",
                                        )
                                    )
                                ).all()

                                for task in active_tasks:
                                    task.status = "Требует внимания"

                        # CHARGING: battery increases by 2%
                        elif robot.status == "charging":

                            robot.battery = min(
                                100,
                                robot.battery + 2,
                            )

                            if robot.battery >= 100:

                                robot.battery = 100
                                robot.status = "available"
                                robot.task = None

                                await create_event(
                                    db,
                                    f"{robot.name} полностью заряжен",
                                    "Робот готов к новым задачам",
                                    "success",
                                )

                        # Battery is never allowed outside 0..100.
                        robot.battery = max(
                            0,
                            min(100, robot.battery),
                        )

                await db.commit()

                # 4. WEBSOCKET BROADCAST
                # Every 2 seconds

                if tick % 2 == 0:

                    robots = (
                        await db.scalars(
                            select(Robot).order_by(Robot.id)
                        )
                    ).all()

                    tasks = (
                        await db.scalars(
                            select(Task).order_by(Task.created_at.desc())
                        )
                    ).all()

                    message = {
                        "type": "update",
                        "robots": [
                            robot_to_dict(robot)
                            for robot in robots
                        ],
                        "tasks": [
                            task_to_dict(task)
                            for task in tasks
                        ],
                    }

                    await manager.broadcast(message)

            tick += 1
            await asyncio.sleep(1)

        except asyncio.CancelledError:
            print("[SIMULATOR] Stopped")
            raise

        except Exception as error:
            print(f"[SIMULATOR ERROR] {error}")
            await asyncio.sleep(2)


def timedelta_seconds(seconds: int):
    from datetime import timedelta
    return timedelta(seconds=seconds)

@asynccontextmanager
async def lifespan(app: FastAPI):

    print("[RMS] Starting application...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await initialize_database()

    simulator_task = asyncio.create_task(simulator_loop())

    yield

    simulator_task.cancel()

    with suppress(asyncio.CancelledError):
        await simulator_task

    await engine.dispose()

    print("[RMS] Application stopped")


app = FastAPI(
    title="RMS - Robot Management System",
    description="API для управления парком автономных роботов",
    version="2.0.0",
    lifespan=lifespan,
)


ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():

    return {
        "name": "Robot Management System",
        "status": "online",
        "version": "2.0.0",
        "docs": "/docs",
        "websocket": "/ws",
    }

@app.post(
    "/api/login",
    response_model=LoginResponse,
)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
):

    # Demo login: any non-empty credentials are accepted.
    user = await db.scalar(
        select(User).where(User.username == "dispatcher")
    )

    if not user:
        user = User(
            username="dispatcher",
            role="Диспетчер",
        )
        db.add(user)
        await db.commit()

    return {
        "user": "dispatcher",
        "role": "Диспетчер",
        "token": FAKE_TOKEN,
    }


@app.get(
    "/api/robots",
    response_model=list[RobotResponse],
)
async def get_robots(
    db: AsyncSession = Depends(get_db),
):

    result = await db.scalars(
        select(Robot).order_by(Robot.id)
    )

    return result.all()


@app.get(
    "/api/robots/{robot_id}",
    response_model=RobotResponse,
)
async def get_robot(
    robot_id: str,
    db: AsyncSession = Depends(get_db),
):

    robot = await db.get(Robot, robot_id)

    if not robot:
        raise HTTPException(
            status_code=404,
            detail="Робот не найден",
        )

    return robot

@app.get(
    "/api/tasks",
    response_model=list[TaskResponse],
)
async def get_tasks(
    db: AsyncSession = Depends(get_db),
):

    result = await db.scalars(
        select(Task).order_by(Task.created_at.desc())
    )

    return [
        task_to_dict(task)
        for task in result.all()
    ]


@app.post(
    "/api/tasks",
    response_model=TaskResponse,
    status_code=201,
    dependencies=[Depends(require_auth)],
)
async def create_task(
    task_data: TaskCreate,
    db: AsyncSession = Depends(get_db),
):

    robot = await db.get(Robot, task_data.robotId)

    if not robot:
        raise HTTPException(
            status_code=404,
            detail="Робот не найден",
        )

    if robot.status != "available":
        raise HTTPException(
            status_code=409,
            detail="Робот сейчас недоступен для новой задачи",
        )

    existing_task = await db.scalar(
        select(Task).where(
            Task.robot_id == robot.id,
            Task.status.in_([
                "Ожидает",
                "В работе",
                "Требует внимания",
            ]),
        )
    )

    if existing_task:
        raise HTTPException(
            status_code=409,
            detail="У робота уже есть активная задача",
        )

    existing_ids = (
        await db.scalars(select(Task.id))
    ).all()

    numbers = [
        int(match.group(1))
        for task_id in existing_ids
        if (match := re.fullmatch(r"T-(\d+)", task_id))
    ]

    next_number = max([107, *numbers]) + 1

    task = Task(
        id=f"T-{next_number}",
        title=task_data.title,
        kind=task_data.kind,
        robot_id=task_data.robotId,
        zone=task_data.zone,
        status="Ожидает",
        priority=task_data.priority,
        time=format_time(),
        created_at=current_time(),
        started_at=None,
    )

    db.add(task)

    await create_event(
        db,
        "Создана новая задача",
        f"{task.title} · назначен робот {robot.name}",
        "info",
    )

    await db.commit()

    return task_to_dict(task)


@app.patch(
    "/api/tasks/{task_id}",
    response_model=TaskResponse,
    dependencies=[Depends(require_auth)],
)
async def update_task(
    task_id: str,
    payload: TaskStatusUpdate,
    db: AsyncSession = Depends(get_db),
):

    if payload.status not in TASK_STATUSES:
        raise HTTPException(
            status_code=422,
            detail="Недопустимый статус задачи",
        )

    task = await db.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Задача не найдена",
        )

    # исправление ошибки статусов:
    if task.status in {"Завершена", "Отменена"}:
        raise HTTPException(
            status_code=400,
            detail=(
                "Нельзя изменить статус завершенной "
                "или отмененной задачи"
            ),
        )

    old_status = task.status
    new_status = payload.status

    if old_status == new_status:
        return task_to_dict(task)

    robot = await db.get(Robot, task.robot_id)
    
    task.status = new_status


    if robot:

        if new_status == "В работе":

            if robot.status != "available":
                raise HTTPException(
                    status_code=409,
                    detail="Робот недоступен",
                )

            robot.status = "working"
            robot.task = task.title
            task.started_at = current_time()

        elif new_status == "Ожидает":

            task.started_at = None

            if robot.status == "working":
                robot.status = "available"
                robot.task = None

        elif new_status in {"Завершена", "Отменена"}:

            if robot.status == "working":
                robot.status = "available"
                robot.task = None

        elif new_status == "Требует внимания":

            robot.status = "warning"

    tone = (
        "success" if new_status == "Завершена"
        else "warning" if new_status == "Требует внимания"
        else "info"
    )

    await create_event(
        db,
        f"Изменён статус задачи {task.id}",
        f"{old_status} → {new_status}",
        tone,
    )

    await db.commit()

    return task_to_dict(task)

@app.get(
    "/api/events",
    response_model=list[EventResponse],
)
async def get_events(
    db: AsyncSession = Depends(get_db),
):

    result = await db.scalars(
        select(Event).order_by(
            Event.id.desc()
        ).limit(100)
    )

    return result.all()


@app.post("/api/admin/reset")
async def reset_system(
    db: AsyncSession = Depends(get_db),
):

    await db.execute(delete(Task))

    robots = (
        await db.scalars(select(Robot))
    ).all()

    for robot in robots:
        robot.battery = 100
        robot.status = "available"
        robot.task = None

    await create_event(
        db,
        "Система сброшена",
        "Все роботы восстановлены, список задач очищен",
        "info",
    )

    await db.commit()

    return {
        "success": True,
        "message": "Система успешно сброшена",
        "robots_reset": len(robots),
        "tasks_deleted": True,
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    origin = websocket.headers.get("origin")

    if origin and origin not in ALLOWED_ORIGINS:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket)

    try:

        while True:
            # Keep connection alive and detect client disconnects.
            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(websocket)


@app.get("/api/health")
async def health_check():

    return {
        "status": "healthy",
        "database": "connected",
        "simulator": "running",
        "websocket": "enabled",
    }
