from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    login: str = Field(min_length=1)
    password: str = Field(min_length=1)


class LoginResponse(BaseModel):
    user: str
    role: str
    token: str


class RobotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    type: str
    model: str
    battery: int
    status: str
    floor: int
    task: str | None


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    kind: str = Field(min_length=1, max_length=80)
    robotId: str = Field(min_length=1)
    zone: str = Field(min_length=1, max_length=255)
    priority: str = "Средний"


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
    time: str
    title: str
    detail: str
    tone: str
