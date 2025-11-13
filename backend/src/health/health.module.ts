import { Module } from '@nestjs/common'
import { HealthController } from 'health/health.controller'
import { UserTempController } from './user-temp.contoller'
import { AuthService } from 'controllers/auth/services'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'domain/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [HealthController, UserTempController],
  providers: [AuthService],
})
export class HealthModule {}
