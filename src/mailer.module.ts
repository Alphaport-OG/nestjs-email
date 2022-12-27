import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { MESSENGER_MODULE_OPTS, MESSENGER_TRANSPORT } from './mail.constants';
import { MailController } from './mail.controller';
import EmailService from './mail.service';
import { IMessengerAsyncOpts, IMessengerOptions } from './mailer.interface';
import {
  createMessengerProvider,
  createMessengerTransportProvider,
} from './mailer.provider';

@Global()
@Module({
  providers: [EmailService, createMessengerTransportProvider()],
  controllers: [MailController],
  exports: [MESSENGER_TRANSPORT, MESSENGER_MODULE_OPTS, EmailService],
})
export default class EmailModule {
  static forRoot(options: IMessengerOptions = {}): DynamicModule {
    return {
      module: EmailModule,
      providers: [...createMessengerProvider(options)],
    };
  }

  static forRootAsync(options: IMessengerAsyncOpts = {}): DynamicModule {
    return {
      module: EmailModule,
      providers: this.createAsyncProvider(options),
    };
  }

  private static createAsyncProvider(opts: IMessengerAsyncOpts): Provider[] {
    if (opts.useFactory) {
      return [
        {
          provide: MESSENGER_MODULE_OPTS,
          useFactory: opts.useFactory,
          inject: opts.inject || [],
        },
      ];
    }

    return [];
  }
}
