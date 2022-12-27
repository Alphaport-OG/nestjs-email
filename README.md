[![pipeline status](https://github.com/Alphaport-OG/nestjs-email/actions/workflows/npm-publish/badge.svg)](https://github.com/alphaport-og/nestjs-email/commits/main)


[![npm](https://img.shields.io/npm/v/nestjs-email)](https://www.npmjs.com/package/nestjs-email)

`nestjs-email` is a [NestJS](https://nestjs.com/) module that provides an nodemailer integration together with [mjml](https://mjml.io/)


### Usage

```
@Module({
  imports: [
    EmailModule.forRoot({
      templatePath: join(__dirname, 'assets', 'templates',
      email: {
        verifyConnectionOnBoot: true,
        generator: {
          engine: 'mjml',
        },
        transport: {
          host: process.env.SMTP_HOST,
          port: +process.env.SMTP_PORT,
          secure: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        },
      },
    }),
  ],
})
```

#### Sending Mails
```
@Injectable()
export class MailSenderService {
  constructor(private readonly mailService: EmailService) {}

  @Post(':template')
  @ApiResponse({ type: String })
  async sendMail(@Param('template') template: string) {
    await this.mailService.sendMail(
      {}, // Arbitrary parameters passed to mjml handlebars template
      { to: 'test@example.com', from: process.env.SMTP_USER },
      template,
      ''
    );
    return 'OK';
  }
}
```