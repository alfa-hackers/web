import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Message } from 'domain/message.entity'
import { Room } from 'domain/room.entity'
import { User } from 'domain/user.entity'
<<<<<<< HEAD
import { GetUserMessagesDto, GetRoomMessagesDto } from 'controllers/messages/dto/messages.dto'
=======
import { GetMessagesQueryDto, GetRoomMessagesDto, GetUserRoomsQueryDto } from 'controllers/messages/dto/messages.dto'
>>>>>>> cc761e0 (chore: renamed all modules paths)

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

  async getMessagesByRoomId(dto: GetRoomMessagesDto) {
    const { roomId, limit, offset } = dto

    const room = await this.roomRepository.findOne({ where: { id: roomId } })

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`)
    }

    const messages = await this.messageRepository.find({
      where: { roomId },
      relations: ['room', 'user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    })

    return {
      data: messages,
      meta: {
        total: messages.length,
        limit,
        offset,
      },
    }
  }

  async getMessagesByUserId(query: GetUserMessagesDto) {
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
}
