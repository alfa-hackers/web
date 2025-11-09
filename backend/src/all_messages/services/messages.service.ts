import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Message } from 'src/domain/message.entity'
import { Room } from 'src/domain/room.entity'
import { User } from 'src/domain/user.entity'
import { GetMessagesQueryDto, GetUserRoomsQueryDto, CreateMessageDto } from '../dto/messages.dto'

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  
    async getMessagesByUserId(query: GetMessagesQueryDto) {
        const { userId } = query


        const userExists = await this.userRepository.findOne({ where: { id: userId } })
        if (!userExists) {
            throw new NotFoundException(`User with ID ${userId} not found`)
        }

        const messages = await this.messageRepository.find({
            where: { userId },
            relations: ['room', 'user'],
            order: { createdAt: 'DESC' },
        })

        return {
            data: messages,
            meta: {
            total: messages.length,
            },
        }
    }

  async getRoomsByUserId(query: GetUserRoomsQueryDto) {
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

  async getMessageById(messageId: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['room', 'user'],
    })

    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`)
    }

    return message
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    })

    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`)
    }

    if (message.userId !== userId) {
      throw new NotFoundException(`You don't have permission to delete this message`)
    }

    await this.messageRepository.remove(message)

    return { success: true, message: 'Message deleted successfully' }
  }
}
