import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('Hello');

  const add = (a, b) => {
    return a + b;
  };

  const x = add(5.6, 3);
  const y = add(4, 3);
  const z = add(15, 3);
  console.log('Sida');
  console.log(x, y, z);
}
bootstrap();
