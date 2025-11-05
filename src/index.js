import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { TEMP_UPLOAD_DIR } from './constants/index.js';
import { initMongoConnection } from './db/initMongoConnection.js';
import { setupServer } from './server.js';

const bootstrap = async () => {
  await fs.mkdir(path.resolve(TEMP_UPLOAD_DIR), { recursive: true });

  await initMongoConnection();
  setupServer();
};

bootstrap();
