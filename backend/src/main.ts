import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cliColor from 'cli-color'
import { registerFastifyPlugins } from './session'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import Fastify from 'fastify'
import { ZodValidationPipe } from './common/pipes'
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes'
import { Logger } from '@nestjs/common'

async function bootstrap() {
  const logger = new Logger('Bootstrap')

  logger.log(cliColor.green('✅ Starting NestJS (Fastify) application...'))
  logger.log('')

  const host = process.env.HOST || '0.0.0.0'
  const port = parseInt(process.env.BACKEND_PORT)
  const baseUrl = `http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`

  const fastifyInstance = Fastify({
    logger: false,
    bodyLimit: parseInt(process.env.BODY_LIMIT || '104857600', 10),
    connectionTimeout: parseInt(process.env.CONNECTION_TIMEOUT || '300000', 10),
  })

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(fastifyInstance),
  )

  app.useGlobalPipes(new ZodValidationPipe())

  await registerFastifyPlugins(app)

  const theme = new SwaggerTheme()
  const options = {
    explorer: true,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription(
      `
      NestJS Boilerplate  
      TypeORM  
      PostgreSQL
    `,
    )
    .setVersion('6.6.6')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api', app as any, document, options)

  await app.listen(port, host)

  logger.log(cliColor.blue(`🌐 Application is running on: ${baseUrl}`))
  logger.log(cliColor.cyan(`📚 Swagger documentation available at: ${baseUrl}/api`))
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap')
  logger.error(cliColor.red('❌ Error during bootstrap:'), error)
  process.exit(1)
})
