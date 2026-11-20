import pytest
from models import Robot, Task
from sqlalchemy import func, select
async def test_create_task(client, db_session):
    robot = Robot(id='robot_01', name='Test Robot', type='cleaner', model='Autoxing X1')
    db_session.add(robot)
    await db_session.commit()
    payload = {'title': 'Test task', 'kind': 'cleaning', 'robotId': 'robot_01', 'zone': 'Floor 1'}
    response = await client.post('/api/tasks', json=payload, headers={'Authorization': 'Bearer fake-token'})
    assert response.status_code == 201
    data = response.json()
    assert data['title'] == 'Test task'
    assert data['kind'] == 'cleaning'
    assert data['robotId'] == 'robot_01'
    assert data['zone'] == 'Floor 1'
    assert data['id']
    assert data['priority'] == 'Обычный'
    assert data['status'] == 'Ожидает'
    assert data['time']
    _id = data['id']
    db_data = await db_session.get(Task, _id)
    assert db_data is not None
    assert db_data.id == data['id']
    assert db_data.title == data['title']
    assert db_data.kind == data['kind']
    assert db_data.robot_id == data['robotId']
    assert db_data.zone == data['zone']
    assert db_data.status == data['status']
    assert db_data.priority == 'Обычный'
    assert db_data.time
async def test_create_task_robot_not_found(client):
    payload = {'title': 'Test task', 'kind': 'cleaning', 'robotId': 'robot_123', 'zone': 'Floor 1'}
    response = await client.post('/api/tasks', json=payload, headers={'Authorization': 'Bearer fake-token'})
    assert response.status_code == 404
    assert response.json()['detail'] == 'Робот не найден'
async def test_create_task_robot_unavailable(client, db_session):
    robot = Robot(id='robot_01', name='Test Robot', type='cleaner', model='Autoxing X1', status='working')
    db_session.add(robot)
    await db_session.commit()
    payload = {'title': 'Test task', 'kind': 'cleaning', 'robotId': 'robot_01', 'zone': 'Floor 1'}
    response = await client.post('/api/tasks', json=payload, headers={'Authorization': 'Bearer fake-token'})
    assert response.status_code == 409
    assert response.json()['detail'] == 'Робот сейчас недоступен для новой задачи'
@pytest.mark.parametrize(
    "task_status",
    ["Ожидает", "В работе", "Требует внимания"]
)
async def test_create_task_robot_has_active_task(client, db_session, task_status):
    robot = Robot(id='robot_01', name='Test Robot', type='cleaner', model='Autoxing X1')
    task = Task(id='T-001', title='Existing task', kind='cleaning', robot_id='robot_01',
                zone='Floor 1', status=task_status, time='12:00')
    db_session.add(robot)
    db_session.add(task)
    await db_session.commit()
    payload = {'title': 'Test task', 'kind': 'cleaning', 'robotId': 'robot_01', 'zone': 'Floor 1'}
    response = await client.post('/api/tasks', json=payload, headers={'Authorization': 'Bearer fake-token'})
    assert response.status_code == 409
    assert response.json()['detail'] == 'У робота уже есть активная задача'
    res = await db_session.scalar(select(func.count()).select_from(Task))
    assert res == 1
# async def test_create_task_blank_title(client, db_session):
#     robot = Robot(id='robot_01', name='Test Robot', type='cleaner', model='Autoxing X1')
#     db_session.add(robot)
#     await db_session.commit()
#     payload = {'title': '   ', 'kind': 'cleaning', 'robotId': 'robot_01', 'zone': 'Floor 1'}
#     response = await client.post('/api/tasks', json=payload, headers={'Authorization': 'Bearer fake-token'})
#     assert response.status_code == 422
# async def test_create_task_high_priority(client, db_session):
#     robot = Robot(id='robot_01', name='Test Robot', type='cleaner', model='Autoxing X1')
#     db_session.add(robot)
#     await db_session.commit()
#     payload = {'title': 'Test task', 'kind': 'cleaning', 'robotId': 'robot_01', 'zone': 'Floor 1', 'priority': 'Высокий'}
#     response = await client.post('/api/tasks', json=payload, headers={'Authorization': 'Bearer fake-token'})
#     assert response.status_code == 201
#     assert response.json()['priority'] == "Высокий"
async def test_create_task_without_title(client, db_session):
    robot = Robot(
        id='robot_01',
        name='Test Robot',
        type='cleaner',
        model='Autoxing X1'
    )
    db_session.add(robot)
    await db_session.commit()
    payload = {
        'kind': 'cleaning',
        'robotId': 'robot_01',
        'zone': 'Floor 1'
    }
    response = await client.post(
        '/api/tasks',
        json=payload,
        headers={'Authorization': 'Bearer fake-token'}
    )
    assert response.status_code == 422
async def test_create_task_title_too_long(client, db_session):
    robot = Robot(
        id='robot_01',
        name='Test Robot',
        type='cleaner',
        model='Autoxing X1'
    )
    db_session.add(robot)
    await db_session.commit()
    payload = {
        'title': 'a' * 256,
        'kind': 'cleaning',
        'robotId': 'robot_01',
        'zone': 'Floor 1'
    }
    response = await client.post(
        '/api/tasks',
        json=payload,
        headers={'Authorization': 'Bearer fake-token'}
    )
    assert response.status_code == 422
@pytest.mark.parametrize(
    'headers',
    [
        {},
        {'Authorization': 'Bearer wrong-token'}
    ],
    ids=['without_token', 'wrong_token']
)
async def test_create_task_invalid_auth(client, headers):
    payload = {
        'title': 'Test task',
        'kind': 'cleaning',
        'robotId': 'robot_01',
        'zone': 'Floor 1'
    }
    response = await client.post(
        '/api/tasks',
        json=payload,
        headers=headers
    )
    assert response.status_code == 401
    assert response.json()['detail'] == 'Unauthorized'