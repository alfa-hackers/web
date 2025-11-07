import * as fastifyCookie from '@fastify/cookie'
import * as fastifySession from '@fastify/session'
import * as fastifyCors from '@fastify/cors'
import { customRedisStore as redisStore } from './providers'
import fastifyStatic from '@fastify/static'
import { join } from 'path'
import { fastifyMultipart } from '@fastify/multipart'
import { cookieConfig, multipartLimits } from './constants'

const frontendUrl = process.env.FRONTEND_URL
const allowedOrigins = frontendUrl.split(',').map((url) => url.trim())

export function registerFastifyPlugins(app) {
  app.register(fastifyMultipart, {
    limits: multipartLimits,
  })

  app.register(fastifyCors, {
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  })

  app.register(fastifyCookie)

  app.register(fastifyStatic, {
    root: join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
    acceptRange: true,
    cacheControl: true,
    maxAge: '1d',
  })

  app.register(fastifyStatic, {
    root: join(process.cwd(), 'static'),
    prefix: '/static/',
    acceptRange: true,
    cacheControl: true,
    maxAge: '1d',
    decorateReply: false,
  })

  app.register(fastifySession, {
    secret: process.env.SESSION_SECRET || 'supersecret',
    saveUninitialized: false,
    cookie: cookieConfig,
    store: redisStore,
  })
}
