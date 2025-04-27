import { Get, Controller, Logger } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('health')
export class HealthController {
  constructor(private readonly logger: Logger) {}

  @Get()
  healthCheck() {
    this.logger.log(`Healthcheck executed. Application is running.`);
    return { status: 'ok' };
  }
}
