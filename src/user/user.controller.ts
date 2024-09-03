import { ApolloClient } from '@apollo/client/core';
import {
  Controller,
  FileTypeValidator,
  Get,
  Inject,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GraphQLService } from 'src/graphql/service/graphql.service';
import { User } from './entities/user.entity';
import {
  FOLLOW_USER_MUTATION,
  GET_FOLLOWERS_QUERY,
  GET_FOLLOWING_USER_QUERY,
} from 'src/graphql/queries/user.queries';
import { FileInterceptor } from '@nestjs/platform-express';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { UserService } from './user.service';
import { Response } from 'express';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  private readonly graphqlService: GraphQLService;
  constructor(
    @Inject('APOLLO_CLIENT') private readonly apolloClient: ApolloClient<any>,
    private readonly userService: UserService,
  ) {
    this.graphqlService = new GraphQLService(apolloClient);
  }

  @Put('/api/:ProfileId/follow')
  async followUser(
    @Param('ProfileId') ProfileId: string,
    @CurrentUser() user: User,
  ) {
    try {
      const result = await this.graphqlService.mutateData<any>(
        FOLLOW_USER_MUTATION,
        { ProfileId, UserId: user.UserId },
      );
      return result.followUser;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @Get('/api/:UserId/following')
  async renderFollowing(@Param('UserId') UserId: string) {
    try {
      const result = await this.graphqlService.mutateData<any>(
        GET_FOLLOWING_USER_QUERY,
        { UserId },
      );
      return result.renderFollowingUser;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @Get('/api/:UserId/followers')
  async renderFollowers(@Param('UserId') UserId: string) {
    try {
      const result = await this.graphqlService.mutateData<any>(
        GET_FOLLOWERS_QUERY,
        { UserId },
      );

      return result.renderFollowers;
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }

  @Post('/api/profilePicture')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024,
          }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: TokenPayload,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.userService.uploadImage(file.buffer, user.UserId, response);
  }

  @Post('/api/coverPhoto')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCoverPhoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024,
          }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.userService.uploadCoverPhoto(file.buffer, user.UserId);
  }
}
