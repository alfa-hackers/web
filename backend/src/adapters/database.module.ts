import { Module, Global } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppDataSource } from './typeorm'

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize()
          console.log('✅ Database connected')
        }
        return AppDataSource.options
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
