import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';

@Module({
  imports: [], // Add any other required modules here, such as AWS SDK module or other modules that require AWS resources.
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
