import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { HealthModule } from './health/health.module'
import { DatabaseModule } from './adapters/database.module'
import { SocketModule } from './socket/socket.module'
import { MessagesModule } from './all_messages/messages.module'

@Module({
  controllers: [],
  providers: [],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      envFilePath: '.env',
    }),

    AuthModule,
    HealthModule,
    DatabaseModule,
    SocketModule,
    MessagesModule
  ],
})
export class AppModule {}
