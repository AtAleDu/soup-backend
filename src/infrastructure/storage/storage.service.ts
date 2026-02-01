import { BadRequestException, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { randomUUID } from "crypto"

type UploadConstraints = {
  allowedMimeTypes: string[]
  maxSizeBytes: number
  isPublic: boolean
  pathPrefix: string
}

type UploadInput = {
  buffer: Buffer
  mimeType: string
  size: number
  originalName: string
}

type UploadResult = {
  url: string
  key: string
  bucket: string
}

@Injectable()
export class StorageService {
  private readonly client: S3Client
  private readonly bucket: string
  private readonly region: string
  private readonly endpoint?: string
  private readonly publicUrl?: string

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.getRequired("S3_BUCKET")
    this.region = this.getRequired("S3_REGION")
    this.endpoint = this.configService.get<string>("S3_ENDPOINT") || undefined
    this.publicUrl = this.configService.get<string>("S3_PUBLIC_URL") || undefined

    this.client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      forcePathStyle: Boolean(this.endpoint),
      credentials: {
        accessKeyId: this.getRequired("S3_ACCESS_KEY"),
        secretAccessKey: this.getRequired("S3_SECRET_KEY"),
      },
    })
  }

  async upload(input: UploadInput, constraints: UploadConstraints): Promise<UploadResult> {
    this.ensureConstraints(constraints)
    this.ensureFile(input, constraints)

    const key = this.buildKey(constraints.pathPrefix, input.originalName)

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: input.buffer,
        ContentType: input.mimeType,
        ACL: constraints.isPublic ? "public-read" : undefined,
      }),
    )

    return {
      key,
      bucket: this.bucket,
      url: this.buildPublicUrl(key, constraints.isPublic),
    }
  }

  private ensureConstraints(constraints: UploadConstraints) {
    if (!constraints) {
      throw new BadRequestException("Не заданы ограничения загрузки")
    }
    if (!constraints.pathPrefix || constraints.pathPrefix.trim() === "") {
      throw new BadRequestException("Не задан путь для загрузки")
    }
    if (!Array.isArray(constraints.allowedMimeTypes) || constraints.allowedMimeTypes.length === 0) {
      throw new BadRequestException("Не заданы допустимые типы файлов")
    }
    if (!Number.isFinite(constraints.maxSizeBytes) || constraints.maxSizeBytes <= 0) {
      throw new BadRequestException("Некорректный лимит размера файла")
    }
  }

  private ensureFile(input: UploadInput, constraints: UploadConstraints) {
    if (!input?.buffer) {
      throw new BadRequestException("Файл не передан")
    }
    if (!constraints.allowedMimeTypes.includes(input.mimeType)) {
      throw new BadRequestException("Недопустимый тип файла")
    }
    if (input.size > constraints.maxSizeBytes) {
      throw new BadRequestException("Размер файла превышает лимит")
    }
  }

  private buildKey(pathPrefix: string, originalName: string): string {
    const safePrefix = pathPrefix.replace(/(^\/|\/$)/g, "")
    const extension = this.getExtension(originalName)
    const name = `${randomUUID()}${extension}`
    return safePrefix ? `${safePrefix}/${name}` : name
  }

  private getExtension(originalName: string): string {
    const dotIndex = originalName.lastIndexOf(".")
    if (dotIndex <= 0 || dotIndex === originalName.length - 1) return ""
    return originalName.slice(dotIndex).toLowerCase()
  }

  private buildPublicUrl(key: string, isPublic: boolean): string {
    if (!isPublic) return ""
    if (this.publicUrl) {
      return `${this.publicUrl.replace(/\/$/, "")}/${key}`
    }
    if (this.endpoint) {
      return `${this.endpoint.replace(/\/$/, "")}/${this.bucket}/${key}`
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`
  }

  private getRequired(name: string): string {
    const value = this.configService.get<string>(name)
    if (!value) {
      throw new Error(`Переменная окружения ${name} обязательна`)
    }
    return value
  }
}
