import { Injectable, InternalServerErrorException } from '@nestjs/common'
import * as Minio from 'minio'

@Injectable()
export class MinioService {
  private readonly minioClient: Minio.Client

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: Number(process.env.MINIO_PORT),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    })
  }

  async uploadFile(
    bucketName: string,
    fileName: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<string> {
    try {
      const exists = await this.minioClient.bucketExists(bucketName)
      if (!exists) {
        await this.minioClient.makeBucket(bucketName, 'us-east-1')
      }

      await this.minioClient.putObject(bucketName, fileName, fileBuffer, fileBuffer.length, {
        'Content-Type': contentType,
      })

      return `${bucketName}/${fileName}`
    } catch (error) {
      console.error(error)
      throw new InternalServerErrorException('Ошибка при загрузке файла в MinIO')
    }
  }
}
