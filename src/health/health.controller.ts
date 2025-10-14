import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Readiness check' })
  readiness() {
    // Check if all required services are available
    const checks = {
      calendar: !!process.env.GOOGLE_CLIENT_ID,
      email: !!process.env.SENDGRID_API_KEY,
      nlp: !!process.env.GEMINI_API_KEY,
    };

    const allReady = Object.values(checks).every((check) => check);

    return {
      ready: allReady,
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Liveness check' })
  liveness() {
    return {
      alive: true,
      timestamp: new Date().toISOString(),
    };
  }
}
