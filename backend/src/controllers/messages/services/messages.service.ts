import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Message } from 'domain/message.entity'
import { Room } from 'domain/room.entity'
import { User } from 'domain/user.entity'
import { GetUserMessagesDto, GetRoomMessagesDto } from 'controllers/messages/dto/messages.dto'
import { FastifyRequest } from 'fastify'

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

  async getMessagesByRoomId(dto: GetRoomMessagesDto, request: FastifyRequest) {
    const { roomId, limit, offset } = dto

    const userTempId = request.session.user_temp_id
    if (!userTempId) {
      throw new UnauthorizedException('User session not found')
    }

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

  async getMessagesByUserId(dto: GetUserMessagesDto, request: FastifyRequest) {
    const { roomId, limit, offset } = dto

    const userTempId = request.session.user_temp_id
    if (!userTempId) {
      throw new UnauthorizedException('User session not found')
    }

    const userExists = await this.userRepository.findOne({ where: { id: userTempId } })
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userTempId} not found`)
    }

    const whereCondition: any = { userId: userTempId }
    if (roomId) {
      whereCondition.roomId = roomId
    }

    const messages = await this.messageRepository.find({
      where: whereCondition,
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
