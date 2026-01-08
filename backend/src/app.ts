import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import teamRoutes from './routes/teamRoutes';
import userRoutes from './routes/userRoutes';
import statsRoutes from './routes/statsRoutes';

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (env.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (env.nodeEnv !== 'production' && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));
if (env.nodeEnv === 'production') {
  app.use(apiLimiter);
}

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
