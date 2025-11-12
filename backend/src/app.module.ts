import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from 'controllers/auth/auth.module'
import { HealthModule } from 'health/health.module'
import { DatabaseModule } from 'adapters/database.module'
import { SocketModule } from 'socket/socket.module'
import { MessagesModule } from 'controllers/messages/messages.module'
import { RoomsModule } from 'controllers/rooms/rooms.module'
import { MinioModule } from 'minio/minio.module'

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
    MessagesModule,
    RoomsModule,
    MinioModule,
  ],
})
export class AppModule {}
