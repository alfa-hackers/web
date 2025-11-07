import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from 'src/domain/user/user'

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: true,
  migrationsRun: true,
  logging: true,
  entities: [User],
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
