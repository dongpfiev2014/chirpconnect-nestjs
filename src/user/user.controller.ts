import { ApolloClient } from '@apollo/client/core';
import { Body, Controller, Get, Inject, Post, Render } from '@nestjs/common';
import { GraphQLService } from 'src/graphql/service/graphql.service';
import { CreateUserInput } from './dto/create-user.input';

@Controller('user')
export class UserController {
  private readonly graphqlService: GraphQLService;
  constructor(
    @Inject('APOLLO_CLIENT') private readonly apolloClient: ApolloClient<any>,
  ) {
    this.graphqlService = new GraphQLService(apolloClient);
  }

  @Get('form')
  @Render('user/form')
  async getForm() {
    return { title: 'User Form' };
  }

  @Get('submit')
  @Render('user/submit')
  getFormSubmit() {
    return {
      title: 'User Form Submit',
      user: {
        FirstName: 'John',
        LastName: 'Doe',
        Username: 'john.doe10',
        Email: 'john.doe10@example.com',
        Password: 'Password123@',
      },
    };
  }

  @Post('submit')
  @Render('user/submit')
  submitForm(@Body() createUserDto: CreateUserInput) {
    console.log('User Data:', createUserDto);

    return {
      title: 'Form Submitted',
      user: createUserDto,
    };
  }
}
