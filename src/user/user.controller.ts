import { Controller, Get, Render } from '@nestjs/common';

@Controller('user')
export class UserController {
  @Get()
  @Render('user/index')
  root() {
    return {
      users: [
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
          age: 30,
        },
        {
          id: 2,
          name: 'John Wath',
          email: 'john.Wath@example.com',
          age: 31,
        },
        {
          id: 3,
          name: 'John Doe2',
          email: 'john.doe@example.com',
          age: 32,
        },
        {
          id: 4,
          name: 'John Wath2',
          email: 'john.Wath@example.com',
          age: 33,
        },
      ],
      pageTitle: 'User page Hahaha',
    };
  }
}
