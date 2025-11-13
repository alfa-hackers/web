import { Module } from '@nestjs/common'
import { HealthController } from 'health/health.controller'
import { UserTempController } from './user-temp.contoller'

@Module({
  controllers: [HealthController, UserTempController],
})
export class HealthModule {}
