import { Inject, Injectable } from '@nestjs/common';
import { SentMessageInfo } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { join } from 'path';
import { JsonObject } from './json';
import { MESSENGER_MODULE_OPTS, MESSENGER_TRANSPORT } from './mail.constants';
import {
  IMessageSendOpts,
  IMessengerOptions,
  IMessengerTransports,
} from './mailer.interface';

@Injectable()
export default class EmailService {
  constructor(
    @Inject(MESSENGER_TRANSPORT)
    private readonly messengerTransports: IMessengerTransports,
    @Inject(MESSENGER_MODULE_OPTS)
    private readonly options: IMessengerOptions,
  ) {}

  emailIsConfigured(): boolean {
    return !!this.messengerTransports.emailTransport;
  }

  /**
   *
   * @param params Arbitrary JSON parameters passed to the mjml handlebars template
   * @param opts Mail sender options (e.g. to:,)
   * @param template Name of the mjml template (must be present in templateDir)
   */
  async sendMail(params: JsonObject, opts: Mail.Options, template: string) {
    const now = new Date(Date.now());
    const today = {
      today: `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`,
    };
    await this.mail(opts, {
      template: join(this.options.templatePath, template),
      params: { ...params, ...today },
    });
  }

  async mail(
    opts: Mail.Options,
    message?: IMessageSendOpts,
  ): Promise<SentMessageInfo> {
    if (!this.messengerTransports.emailTransport) {
      throw new Error('Email transport not configured');
    }

    if (message) {
      opts.html = await this.messengerTransports.emailTemplate.generate(
        message.template,
        message.params || {},
      );
    }

    return this.messengerTransports.emailTransport.sendMail(opts);
  }

  async verifyEmailConnection(): Promise<boolean> {
    if (!this.messengerTransports.emailTransport) {
      throw new Error('Email transport not configured');
    }

    const isVerified = await this.messengerTransports.emailTransport.verify();
    if (!isVerified) {
      throw new Error('Unable to verify email transport connection');
    }

    return true;
  }
}
