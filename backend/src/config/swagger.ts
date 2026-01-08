import { Options } from 'swagger-jsdoc';
import swaggerJSDoc from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Team Task Manager API',
      version: '1.0.0',
      description: 'API documentation for the Team Task Manager backend.',
    },
    servers: [{ url: 'http://localhost:5000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/auth/signup': {
        post: {
          summary: 'User signup',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'User login',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/auth/logout': {
        post: {
          summary: 'User logout',
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/auth/me': {
        get: {
          summary: 'Get current user',
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/tasks': {
        get: {
          summary: 'List tasks',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'priority', in: 'query', schema: { type: 'string' } },
            { name: 'teamId', in: 'query', schema: { type: 'string' } },
            { name: 'assignedTo', in: 'query', schema: { type: 'string' } },
            { name: 'dueBefore', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'dueAfter', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'createdBy', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'sortBy', in: 'query', schema: { type: 'string' } },
            { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
          ],
          responses: { '200': { description: 'OK' } },
        },
        post: {
          summary: 'Create task',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'teamId'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string' },
                    priority: { type: 'string' },
                    assignedTo: { type: 'string' },
                    teamId: { type: 'string' },
                    dueDate: { type: 'string', format: 'date' },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/tasks/{id}': {
        get: {
          summary: 'Get task',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
        put: {
          summary: 'Update task',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
        delete: {
          summary: 'Delete task',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/tasks/search': {
        get: {
          summary: 'Search tasks',
          parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/teams': {
        get: { summary: 'List teams', responses: { '200': { description: 'OK' } } },
        post: {
          summary: 'Create team',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    memberIds: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/teams/{id}': {
        get: {
          summary: 'Get team',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
        put: {
          summary: 'Update team',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
        delete: {
          summary: 'Delete team',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/teams/{id}/members': {
        post: {
          summary: 'Add team member',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId'],
                  properties: { userId: { type: 'string' } },
                },
              },
            },
          },
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/users/search': {
        get: {
          summary: 'Search user by email',
          parameters: [{ name: 'email', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/users': {
        get: {
          summary: 'List users',
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'role', in: 'query', schema: { type: 'string' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { '200': { description: 'OK' } },
        },
        post: {
          summary: 'Create user (admin)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password', 'role'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    role: { type: 'string', enum: ['member', 'lead'] },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/users/{id}/role': {
        put: {
          summary: 'Update user role',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['role'],
                  properties: { role: { type: 'string', enum: ['member', 'lead', 'admin'] } },
                },
              },
            },
          },
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/users/me/password': {
        put: {
          summary: 'Change password (current user)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['currentPassword', 'newPassword'],
                  properties: {
                    currentPassword: { type: 'string' },
                    newPassword: { type: 'string', minLength: 8 },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/stats': {
        get: {
          summary: 'Get task statistics',
          responses: { '200': { description: 'OK' } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);
