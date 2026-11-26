from typing import Annotated, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StringConstraints,
    field_validator,
)

class LoginRequest(BaseModel):
    login: str = Field(min_length=1)
    password: str = Field(min_length=1)


class LoginResponse(BaseModel):
    user: str
    role: str
    token: str


class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class RobotResponse(BaseModel):
    id: str
    name: str
    type: str
    model: str
    battery: int
    status: str
    floor: int
    task: str | None

    model_config = ConfigDict(from_attributes=True)

NonEmptyString = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=1,
        max_length=255,
    ),
]


class TaskCreate(BaseModel):
    title: NonEmptyString
    kind: Annotated[
        str,
        StringConstraints(
            strip_whitespace=True,
            min_length=1,
            max_length=100,
        ),
    ]
    robotId: Annotated[
        str,
        StringConstraints(
            strip_whitespace=True,
            min_length=1,
        ),
    ]
    zone: NonEmptyString

    priority: Literal["Обычный", "Высокий"] = "Обычный"

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value: str) -> str:
        if value not in ("Обычный", "Высокий"):
            raise ValueError(
                "Приоритет должен быть 'Обычный' или 'Высокий'"
            )
        return value


class TaskStatusUpdate(BaseModel):
    status: str


class TaskResponse(BaseModel):
    id: str
    title: str
    kind: str
    robotId: str
    zone: str
    status: str
    priority: str
    time: str


class EventResponse(BaseModel):
    id: int
    time: str
    title: str
    detail: str
    tone: str


class RealtimeUpdate(BaseModel):
    type: str = "update"
    robots: list[RobotResponse]
    tasks: list[TaskResponse]