import app from './app';
import { connectDb } from './config/db';
import { env } from './config/env';

const start = async (): Promise<void> => {
  await connectDb();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${env.port}`);
  });
};

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', error);
  process.exit(1);
});
