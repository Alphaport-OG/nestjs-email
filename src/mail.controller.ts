import { Controller, Param, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import EmailService from './mail.service';

@Controller('mail')
@ApiTags('Mail')
export class MailController {
  constructor(private readonly mailService: EmailService) {}

  @Post(':template')
  @ApiResponse({ type: String })
  async sendMail(@Param('template') template: string) {
    await this.mailService.sendMail(
      {},
      { to: 'sebastian.geschke@alphaport.at', from: process.env.SMTP_USER },
      template,
      '',
    );
    // await this.mailService.sendMail(
    //   { to: 'sebastian.geschke@alphaport.at', from: process.env.SMTP_USER },
    //   { template: join(__dirname, 'templates', template), params: { ...today } }
    // );
    return 'OK';
  }
}
