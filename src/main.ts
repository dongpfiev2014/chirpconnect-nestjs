import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  console.log('Server is running on http://localhost:3000');
  // Implement error handling middleware
  // Implement authentication middleware

  // Implement rate limiting middleware
  // Implement caching middleware
  // Implement database connection and migration setup
}

bootstrap();
