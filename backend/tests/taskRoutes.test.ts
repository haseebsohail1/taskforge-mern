process.env.JWT_SECRET = 'testsecret';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';

import request from 'supertest';

import app from '../src/app';
import { Team } from '../src/models/Team';
import { Task } from '../src/models/Task';
import { User } from '../src/models/User';
import { signToken } from '../src/utils/jwt';

const createAuthUser = async () => {
  const user = await User.create({ name: 'Test User', email: 'user@example.com', password: 'Password123!' });
  const token = signToken({ userId: user._id.toString(), role: user.role, tokenVersion: user.tokenVersion });
  return { user, token };
};

describe('Task routes', () => {
  it('blocks requests without token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('creates task when authenticated and valid', async () => {
    const { user, token } = await createAuthUser();
    const team = await Team.create({ name: 'Alpha', members: [user._id], createdBy: user._id });

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Task',
        description: 'Test',
        teamId: team._id.toString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.task.title).toBe('New Task');
  });

  it('supports filtering by status', async () => {
    const { user, token } = await createAuthUser();
    const team = await Team.create({ name: 'Beta', members: [user._id], createdBy: user._id });

    await Task.create({
      title: 'Todo Task',
      teamId: team._id,
      createdBy: user._id,
      status: 'todo',
    });
    await Task.create({
      title: 'Done Task',
      teamId: team._id,
      createdBy: user._id,
      status: 'done',
    });

    const res = await request(app)
      .get('/api/tasks?status=todo')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].title).toBe('Todo Task');
  });
});
