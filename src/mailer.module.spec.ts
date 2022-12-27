import { MESSENGER_MODULE_OPTS } from './mail.constants';
import { IMessengerOptions } from './mailer.interface';
import EmailModule from './mailer.module';
import { createMessengerProvider } from './mailer.provider';

jest.mock('./mailer.provider', () => ({
  createMessengerProvider: jest.fn(),
  createMessengerTransportProvider: jest.fn(),
}));

describe('Messenger module', () => {
  describe('Static methods', () => {
    describe('#forRoot', () => {
      it('should forRoot an instance of the module with no options', () => {
        const providers = [];
        (<any>createMessengerProvider).mockReturnValue(providers);

        expect(EmailModule.forRoot()).toEqual({
          providers,
          module: EmailModule,
        });

        expect(createMessengerProvider).toBeCalledWith({});
      });

      it('should forRoot an instance of the module with some options', () => {
        const providers = ['provider1', 'provider2'];
        (<any>createMessengerProvider).mockReturnValue(providers);

        const opts = {
          hello: 'world',
        } as IMessengerOptions;

        expect(EmailModule.forRoot(opts)).toEqual({
          providers,
          module: EmailModule,
        });

        expect(createMessengerProvider).toBeCalledWith(opts);
      });
    });

    describe('#forRootAsync', () => {
      it('should forRoot an instance with no options', () => {
        expect(EmailModule.forRootAsync()).toEqual({
          providers: [],
          module: EmailModule,
        });
      });

      it('should forRoot an instance with some useFactory options and no injects', () => {
        const opts = {
          useFactory: jest.fn(),
        };

        expect(EmailModule.forRootAsync(opts)).toEqual({
          providers: [
            {
              provide: MESSENGER_MODULE_OPTS,
              useFactory: opts.useFactory,
              inject: [],
            },
          ],
          module: EmailModule,
        });
      });

      it('should forRoot an instance with some useFactory options and some injects', () => {
        const opts = {
          useFactory: jest.fn(),
          inject: ['some injector'],
        };

        expect(EmailModule.forRootAsync(opts)).toEqual({
          providers: [
            {
              provide: MESSENGER_MODULE_OPTS,
              useFactory: opts.useFactory,
              inject: opts.inject,
            },
          ],
          module: EmailModule,
        });
      });
    });
  });
});
