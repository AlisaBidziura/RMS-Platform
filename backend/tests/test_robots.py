from models import Robot
async def test_get_robots_empty(client):
    response = await client.get('/api/robots')
    assert response.status_code == 200
    assert response.json() == []
async def test_get_robots_one(client, db_session):
    robot = Robot(
        id='robot_01',
        name='Test Robot',
        type='cleaner',
        model='Autoxing X1'
    )
    db_session.add(robot)
    await db_session.commit()
    response = await client.get('/api/robots')
    assert response.status_code == 200
    assert response.json() == [{'id': 'robot_01', 'name':'Test Robot',
                                'type':'cleaner', 'model':'Autoxing X1',
                                'battery': 100, 'status': 'available', 'floor': 1, 'task':None}]
async def test_get_robots_multiple(client, db_session):
    robot3 = Robot(id='robot_03', name='Test Robot', type='cleaner', model='Autoxing X1')
    robot1 = Robot(id='robot_01', name='Test Robot', type='cleaner', model='Autoxing X1')
    robot2 = Robot(id='robot_02', name='Test Robot', type='cleaner', model='Autoxing X1')
    db_session.add(robot3)
    db_session.add(robot1)
    db_session.add(robot2)
    await db_session.commit()
    response = await client.get('/api/robots')
    assert len(response.json()) == 3
    assert response.status_code == 200
    assert response.json()[0]['id'] == 'robot_01'
    assert response.json()[1]['id'] == 'robot_02'
    assert response.json()[2]['id'] == 'robot_03'