from datetime import datetime, timedelta
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def now():
    return datetime.now()


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)


class Robot(Base):
    __tablename__ = "robots"

    id: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)

    battery: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default="available", nullable=False
    )
    floor: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    task: Mapped[str | None] = mapped_column(String(255), nullable=True)


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(20), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    kind: Mapped[str] = mapped_column(String(100), nullable=False)

    robot_id: Mapped[str] = mapped_column(
        "robotId",
        ForeignKey("robots.id"),
        nullable=False,
    )

    zone: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="Ожидает", nullable=False
    )
    priority: Mapped[str] = mapped_column(
        String(50), default="Обычный", nullable=False
    )
    time: Mapped[str] = mapped_column(String(5), nullable=False)

    # Внутренние поля для работы симулятора.
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=now, nullable=False
    )
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True
    )


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    time: Mapped[str] = mapped_column(String(8), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    detail: Mapped[str] = mapped_column(String(500), nullable=False)
    tone: Mapped[str] = mapped_column(
        String(20), default="info", nullable=False
    )
