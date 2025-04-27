import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000,
}));
