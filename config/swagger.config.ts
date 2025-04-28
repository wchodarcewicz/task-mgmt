import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => ({
  path: process.env.SWAGGER_PATH || 'docs',
  title: process.env.SWAGGER_TITLE || 'Project API',
  description: process.env.SWAGGER_DESCRIPTION || 'API docs',
  version: process.env.SWAGGER_VERSION || process.env.npm_package_version,
}));
