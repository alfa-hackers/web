import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthController } from './auth.controller'
import { AuthService } from './services'
import { SessionGuard } from './guards/session.guard'
import { User } from 'src/domain/user/user'

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
