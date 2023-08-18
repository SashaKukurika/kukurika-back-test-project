import {
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';

import { ItemTypeEnum } from './enums/item-type.enum';

@Injectable()
export class S3Service {
  private logger = new Logger(S3Service.name);
  private readonly region: string;
  private s3: S3Client;
  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>(
      'AWS_S3_REGION' || 'eu-north-1',
    );
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_KEY' || 'secretKey',
        ),
        accessKeyId: this.configService.get<string>(
          'AWS_ACCESS_KEY' || 'accessKey',
        ),
      },
    });
  }
  async uploadFile(
    file: Express.Multer.File,
    itemType: ItemTypeEnum,
    itemId: string,
  ): Promise<string> {
    const filePath = this.buildPath(itemType, itemId, file.originalname);

    const input: PutObjectCommandInput = {
      Body: file.buffer,
      Bucket: this.configService.get<string>('AWS_S3_NAME'),
      Key: filePath,
      ContentType: file.mimetype,
      ACL: this.configService.get<string>('AWS_S3_ACL'),
    };

    try {
      const response: PutObjectCommandOutput = await this.s3.send(
        new PutObjectCommand(input),
      );
      if (response.$metadata.httpStatusCode === 200) {
        return filePath;
      }
      throw new Error('Image not saved in s3!');
    } catch (err) {
      this.logger.error('Cannot save file to s3,', err);
      throw err;
    }
  }

  public async deleteFile(filePath: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.configService.get<string>('AWS_S3_NAME'),
        Key: filePath,
      }),
    );
  }
  private buildPath(type: string, id: string, fileName: string): string {
    return `${type}/${id}/${v4()}${fileName}`;
  }
}
