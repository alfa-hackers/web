import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthController } from 'controllers/auth/auth.controller'
import { AuthService } from 'controllers/auth/services'
import { SessionGuard } from 'controllers/auth/guards/session.guard'
import { User } from 'domain/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionGuard,
    // {
    //   provide: 'APP_GUARD',
    //   useClass: SessionGuard,
    // },
  ],
  exports: [AuthService, SessionGuard],
})
export class AuthModule {}
