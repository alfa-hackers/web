import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Room } from 'domain/room.entity'
import { User } from 'domain/user.entity'
import { FastifyRequest } from 'fastify'

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getRoomsByUserId(request: FastifyRequest) {
    const userTempId = request.session.user_temp_id
    if (!userTempId) {
      throw new UnauthorizedException('User session not found')
    }

    const userExists = await this.userRepository.findOne({ where: { id: userTempId } })
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userTempId} not found`)
    }

    const rooms = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.owner', 'owner')
      .leftJoin('room.userRooms', 'userRoom')
      .where('userRoom.userId = :userId', { userId: userTempId })
      .orderBy('room.createdAt', 'DESC')
      .getMany()

    return {
      data: rooms,
      meta: {
        total: rooms.length,
      },
    }
  }

  async deleteRoom(roomId: string) {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['owner'],
    })

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`)
    }

    await this.roomRepository.remove(room)

    return { success: true, message: 'Room deleted successfully' }
  }
}
