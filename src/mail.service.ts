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

  async sendMail(
    params: JsonObject,
    opts: Mail.Options,
    template: string,
    domain: string,
    link?: string,
  ) {
    const now = new Date(Date.now());
    const today = {
      today: `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`,
    };
    const logo = `${domain}/logo.png`;
    await this.mail(opts, {
      template: join(__dirname, 'assets', 'templates', template),
      params: { user: params, ...today, link, logo },
    });
  }

  async sendMessageMail(
    user: JsonObject,
    event: JsonObject,
    message: string,
    opts: Mail.Options,
    template: string,
    domain: string,
    link?: string,
  ) {
    const now = new Date(Date.now());
    const today = {
      today: `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`,
    };
    const logo = `${domain}/logo.png`;
    await this.mail(opts, {
      template: join(__dirname, 'assets', 'templates', template),
      params: { user, event, message, ...today, link, logo },
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
