
import pytest_asyncio

from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.engine import URL
from main import app, get_db
from models import Base
# Если нужно, запустить отдельно, без основных тестов, то чтобы импортировалась нормально запускай в папке бэкенда

@pytest_asyncio.fixture
async def test_engine(tmp_path):
    db_file = tmp_path / "test.db"

    database_url = URL.create(
        "sqlite+aiosqlite",
        database=str(db_file),
    )

    engine = create_async_engine(database_url)

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture
async def test_session_factory(test_engine):
    return async_sessionmaker(
        test_engine,
        expire_on_commit=False,
    )


@pytest_asyncio.fixture
async def db_session(test_session_factory):
    async with test_session_factory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(test_session_factory):
    async def override_get_db():
        async with test_session_factory() as session:
            yield session

    previous_overrides = app.dependency_overrides.copy()
    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)

    try:
        async with AsyncClient(
            transport=transport,
            base_url="http://test",
        ) as async_client:
            yield async_client
    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(previous_overrides)
