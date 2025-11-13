import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from 'domain/user.entity'
import { decodeSession } from '../helpers'

@Injectable()
export class RoomConnectionService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async handleConnection(socket: Socket) {
    const cookieHeader = socket.handshake.headers.cookie

    let userTempId: string | undefined

    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce(
        (acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        },
        {} as Record<string, string>,
      )

      const sessionCookie = cookies['user_temp_id']
      if (sessionCookie) {
        const decodedSessionCookie = decodeURIComponent(sessionCookie)
        const sessionData = decodeSession(decodedSessionCookie)

        if (sessionData?.user_temp_id) {
          userTempId = sessionData.user_temp_id
        }
      }
    }

    let user: User
    if (userTempId) {
      user = await this.userRepository.findOne({ where: { userTempId } })
      if (!user) {
        user = this.userRepository.create({
          id: userTempId,
          username: `temp_${userTempId}`,
          userTempId,
          role: 'temp',
          temp: true,
        })
        await this.userRepository.save(user)
      }
    } else {
      user = this.userRepository.create({
        username: `user_${Date.now()}`,
        role: 'user',
        temp: true,
      })
      await this.userRepository.save(user)
    }

    return { user, userTempId }
  }
}
