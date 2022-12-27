import { Provider } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { MESSENGER_MODULE_OPTS, MESSENGER_TRANSPORT } from './mail.constants';
import {
  IMessageGenerator,
  IMessageGeneratorConfig,
  IMessengerOptions,
  IMessengerTransports,
} from './mailer.interface';
import MessageGenerator from './message.generator';
import HandlebarsStrategy from './strategies/handlebars.strategy';
import MjmlStrategy from './strategies/mjml.strategy';

export function createMessengerProvider(useValue: IMessengerOptions = {}) {
  return [
    {
      useValue,
      provide: MESSENGER_MODULE_OPTS,
    },
  ];
}

export function createMessengerTransportProvider(): Provider {
  return {
    provide: MESSENGER_TRANSPORT,
    inject: [MESSENGER_MODULE_OPTS],
    async useFactory(
      opts: IMessengerOptions = {},
    ): Promise<IMessengerTransports> {
      let emailTransport: Mail | undefined;
      let emailTemplate: IMessageGenerator | undefined;

      /* Configure the email provider */
      if (opts.email) {
        emailTransport = createTransport(opts.email.transport);

        /* Verify the connection by default */
        if (opts.email.verifyConnectionOnBoot !== false) {
          const isVerified = await emailTransport.verify();
          if (!isVerified) {
            throw new Error('Messenger: nodemailer failed to verify');
          }
        }

        /* Configure the email generator */
        if (opts.email.generator) {
          const generatorConfig: IMessageGeneratorConfig = {
            ...opts.email.generator,
          } as IMessageGeneratorConfig;

          const { engine } = opts.email.generator;
          if (typeof engine === 'string') {
            /* Load the engine strategy */
            if (engine === 'mjml') {
              generatorConfig.engine = new MjmlStrategy();
            } else if (engine === 'handlebars') {
              generatorConfig.engine = new HandlebarsStrategy();
            }
          }

          emailTemplate = new MessageGenerator(generatorConfig);
        }
      }

      return {
        emailTemplate,
        emailTransport,
      };
    },
  };
}
