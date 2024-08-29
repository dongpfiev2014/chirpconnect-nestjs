import {
  Controller,
  Get,
  Inject,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserInput } from 'src/user/dto/create-user.input';
import { User } from 'src/user/entities/user.entity';
import { ApolloClient } from '@apollo/client/core';
import { GraphQLService } from 'src/graphql/service/graphql.service';
import { CREATE_USER_MUTATION } from 'src/graphql/queries/user.queries';
import { RedirectIfAuthenticatedGuard } from './guards/redirect-authenticated.guard';

@Controller('auth')
export class AuthController {
  private readonly graphqlService: GraphQLService;
  constructor(
    private readonly authService: AuthService,
    @Inject('APOLLO_CLIENT') private readonly apolloClient: ApolloClient<any>,
  ) {
    this.graphqlService = new GraphQLService(apolloClient);
  }
  @UseGuards(RedirectIfAuthenticatedGuard)
  @Get('login')
  @Render('login')
  loginPug() {
    return;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Render('login')
  async login(
    @CurrentUser() user: User,
    @Req() request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const payload = request.body as CreateUserInput;
    if (request.authError) {
      return { ...payload, errorMessage: request.authError };
    }
    await this.authService.login(user, response);
    return { successMessage: 'Login successful. Redirecting...' };
  }

  @UseGuards(RedirectIfAuthenticatedGuard)
  @Get('register')
  @Render('register')
  registerPug() {
    return;
  }

  @Post('register')
  @Render('register')
  async register(@Req() req: Request) {
    const payload = req.body as CreateUserInput;

    const FirstName = payload.FirstName.trim();
    const LastName = payload.LastName.trim();
    const Username = payload.Username.trim();
    const Email = payload.Email.trim();
    const Password = payload.Password;

    if (FirstName && LastName && Username && Email && Password) {
      try {
        const newUser = await this.graphqlService.mutateData<any>(
          CREATE_USER_MUTATION,
          { input: payload },
        );
        console.log(newUser);
        return {
          ...payload,
          successMessage:
            'Account successfully created. Redirecting to login...',
        };
      } catch (error) {
        const errorDetailMessage =
          error.graphQLErrors[0].extensions.originalError.message;
        return {
          ...payload,
          errorMessage: error.message,
          errorDetailMessage: Array.isArray(errorDetailMessage)
            ? errorDetailMessage[0]
            : '',
        };
      }
    } else {
      const errorMessage = 'Make sure each field has a valid value.';
      return { ...payload, errorMessage };
    }
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    this.authService.logout(response);
    response.redirect('/auth/login');
  }
}
