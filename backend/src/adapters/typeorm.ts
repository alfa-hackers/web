import 'reflect-metadata'
import { Message } from 'src/domain/message.entity'
import { Room } from 'src/domain/room.entity'
import { UserRoom } from 'src/domain/user-room.entity'
import { User } from 'src/domain/user.entity'
import { DataSource } from 'typeorm'

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: true,
  migrationsRun: true,
  logging: true,
  entities: [User, Message, Room, UserRoom],
  migrations: ['dist/migrations/*.js'],
  ssl: false,
})

export const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }
    console.log('✅ Database connected')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}
