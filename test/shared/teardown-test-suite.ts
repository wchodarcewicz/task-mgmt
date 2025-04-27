import { INestApplication } from '@nestjs/common';

const teardownTestSuite = async (app: INestApplication) => {
  await app.close();
};

export default teardownTestSuite;
