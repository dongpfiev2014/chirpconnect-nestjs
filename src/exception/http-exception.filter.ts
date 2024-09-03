// http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const _request = ctx.getRequest<Request>();
    // Kiểm tra xem response đã được gửi hay chưa
    if (response.headersSent) {
      return;
    }

    const status = exception.getStatus();
    const message = exception.message || 'Internal server error';

    if (response.status && typeof response.status === 'function') {
      // For HTTP context
      if (status >= HttpStatus.BAD_REQUEST) {
        response.status(status).send(`
        <!DOCTYPE html>
          <html lang="en">

          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Unauthorized</title>
            <link rel="stylesheet" href="/css/forbidden.css">
          </head>

          <body>
            <h1>Forbidden!</h1>
            <h2>Code ${status} - ${message}</h2>
            <div id="jail">
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml"
                xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 1000 1000" preserveAspectRatio="xMinYMin"
                id="spinner">
                <!--     thank you https://stackoverflow.com/posts/15496546/revisions -->
                <defs>
                  <path id="textPath" d="M 250 500 A 250,250 0 1 1 250 500.0001" />
                </defs>
                <text x="0" y="0" text-anchor="left" style="font-size:90pt;">
                  <textPath xlink:href="#textPath" startOffset="0%">MOUSE JAIL</textPath>
                  <textPath xlink:href="#textPath" startOffset="50%">MOUSE JAIL</textPath>
                </text>
              </svg>
              <div id="cursor"></div>
            </div>
            <script src="/js/forbidden.js"></script>
          </body>

          </html>
        `);
      } else {
        response.status(status).json({
          statusCode: status,
          message: message,
          error: exception.name,
        });
      }
    } else {
      // For GraphQL Exception
      // console.error('Non-HTTP context, cannot use response.status');
      // throw new HttpException(message, status);
    }
  }
}
