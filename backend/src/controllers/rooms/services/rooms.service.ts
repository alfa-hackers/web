import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Message } from 'domain/message.entity'
import { Room } from 'domain/room.entity'
import { User } from 'domain/user.entity'
import { GetUserRoomsDto } from 'controllers/rooms/dto/rooms.dto'

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}


  async getRoomsByUserId(query: GetUserRoomsDto) {
    const { userId } = query

    const userExists = await this.userRepository.findOne({ where: { id: userId } })
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }

    const rooms = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.owner', 'owner')
      .leftJoin('room.userRooms', 'userRoom')
      .where('userRoom.userId = :userId', { userId })
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
