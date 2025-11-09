import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

export interface AIResponse {
  content: string
  model: string
  usage: any
}

@Injectable()
export class AIService {
  constructor(private configService: ConfigService) {}

  async generateResponse(message: string): Promise<AIResponse> {
    const apiUrl =
      this.configService.get<string>('OPENAI_API_URL') ||
      'https://openrouter.ai/api/v1/chat/completions'
    const model = this.configService.get<string>('OPENAI_MODEL') || 'openai/gpt-3.5-turbo'
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')
    const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000'

    try {
      const response = await axios.post(
        apiUrl,
        {
          model,
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant.' },
            { role: 'user', content: message },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': backendUrl,
            'X-Title': 'NestJS WebSocket Chat',
          },
          timeout: 30000,
        },
      )

      return {
        content: response.data.choices?.[0]?.message?.content || 'No response from AI.',
        model: response.data.model,
        usage: response.data.usage,
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message
      throw new Error(errorMessage)
    }
  }
}
