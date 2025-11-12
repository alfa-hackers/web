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

  async generateResponse(
    messages: Array<{ role: string; content: string }>,
    temperature: number = 0.7,
    messageType: 'text' | 'pdf' | 'word' | 'excel' = 'text',
  ): Promise<AIResponse> {
    const apiUrl =
      this.configService.get<string>('OPENAI_API_URL') ||
      'https://openrouter.ai/api/v1/chat/completions'
    const model = this.configService.get<string>('OPENAI_MODEL') || 'openai/gpt-3.5-turbo'
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')
    const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000'

    const payload: Array<{ role: string; content: string }> = [
      { role: 'system', content: 'You are a helpful AI assistant.' },
      ...messages,
    ]

    switch (messageType) {
      case 'pdf':
        payload.push({
          role: 'system',
          content: `You are an AI that processes PDF documents.
                  Generate ONLY plain text summary from the PDF content.
                  Do NOT include explanations, comments, extra words, or formatting.
                  Output must be clean, readable text with no extra content.`,
        })
        break

      case 'word':
        payload.push({
          role: 'system',
          content: `You are an AI that processes Word documents.
                Generate ONLY plain text summary from the Word content.
                Do NOT include explanations, comments, extra words, or formatting.
                Output must be clean, readable text with no extra content.`,
        })
        break

      case 'excel':
        payload.push({
          role: 'system',
          content: `You are an AI that processes Excel data.
            Generate ONLY raw CSV text from the Excel content.
            Do NOT include explanations, comments, extra words, or formatting.
            Output must be pure CSV, with commas separating values and newlines separating rows.`,
        })
        break

      case 'text':
      default:
        payload.push({ role: 'system', content: '' })
        break
    }

    try {
      const response = await axios.post(
        apiUrl,
        { model, messages: payload, temperature },
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

      const rawContent = response.data.choices?.[0]?.message?.content || 'No response from AI.'
      const content = rawContent.trim()

      return {
        content,
        model: response.data.model,
        usage: response.data.usage,
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message
      throw new Error(errorMessage)
    }
  }
}
