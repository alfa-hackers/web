import * as fastifyCookie from '@fastify/cookie'
import * as fastifySession from '@fastify/session'
import * as fastifyCors from '@fastify/cors'
import { customRedisStore as redisStore } from './providers'
import fastifyStatic from '@fastify/static'
import { join } from 'path'
import { fastifyMultipart } from '@fastify/multipart'
import { cookieConfig, multipartLimits } from './constants'

const allowedOrigins = ['https://dev.whirav.ru', 'https://whirav.ru', 'http://localhost:3000']

export function registerFastifyPlugins(app) {
  const fastify = app.getHttpAdapter().getInstance()

  fastify.register(fastifyMultipart, {
    limits: multipartLimits,
  })

  fastify.register(fastifyCors, {
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  })

  fastify.register(fastifyCookie)

  fastify.register(fastifyStatic, {
    root: join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
    acceptRange: true,
    cacheControl: true,
    maxAge: '1d',
  })

  fastify.register(fastifyStatic, {
    root: join(process.cwd(), 'static'),
    prefix: '/static/',
    acceptRange: true,
    cacheControl: true,
    maxAge: '1d',
    decorateReply: false,
  })

  fastify.register(fastifySession, {
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    cookie: cookieConfig,
    store: redisStore,
  })

  fastify.addHook('onRequest', async (req, res) => {
    if (!req.cookies.user_temp_id) {
      const tempId = crypto.randomUUID()
      res.setCookie('user_temp_id', tempId, {
        path: '/',
      })
    }

    if (req.session) {
      req.session.touch?.()
      await req.session.save?.()
    }
  })
}
