import EmailService from './mail.service';
import { IMessengerTransports } from './mailer.interface';

describe('Messenger service', () => {
  let messenger: EmailService;
  let messengerTransports: IMessengerTransports;
  beforeEach(() => {
    messengerTransports = {
      emailTransport: {
        sendMail: jest.fn().mockResolvedValue(true),
        verify: jest.fn(),
      },
    };
    messenger = new EmailService(messengerTransports);
  });

  describe('#emailIsConfigured', () => {
    it('should return false if email not configured', () => {
      messenger = new EmailService({});

      expect(messenger.emailIsConfigured()).toBe(false);
    });
    it('should return true if email configured', () => {
      expect(messenger.emailIsConfigured()).toBe(true);
    });
  });

  describe('#mail', () => {
    it('should error if no email transport configured', async () => {
      messenger = new EmailService({});

      try {
        await messenger.mail({});

        throw new Error('invalid');
      } catch (err) {
        expect(err).toEqual(new Error('Email transport not configured'));
      }
    });

    it('should generate the HTML if a message is present and then send', async () => {
      const opts = {
        to: 'toAddress',
      };

      const html = 'htmlTemplate';
      messengerTransports.emailTemplate = {
        generate: jest.fn().mockResolvedValue(html),
        previewEnabled: jest.fn().mockResolvedValue(false),
      };

      const template = 'template name';

      expect(
        await messenger.mail(opts, {
          template,
        })
      ).toBe(true);

      expect(messengerTransports.emailTemplate.generate).toBeCalledWith(
        template,
        {}
      );

      expect(messengerTransports.emailTransport.sendMail).toBeCalledWith({
        html,
        to: 'toAddress',
      });
    });

    it('should generate the HTML if a message is present with params and then send', async () => {
      const opts = {
        to: 'toAddress',
      };

      const html = 'htmlTemplate';
      messengerTransports.emailTemplate = {
        generate: jest.fn().mockResolvedValue(html),
        previewEnabled: jest.fn().mockResolvedValue(false),
      };

      const template = 'template name';
      const params = {
        some: 'params',
      };

      expect(
        await messenger.mail(opts, {
          template,
          params,
        })
      ).toBe(true);

      expect(messengerTransports.emailTemplate.generate).toBeCalledWith(
        template,
        params
      );

      expect(messengerTransports.emailTransport.sendMail).toBeCalledWith({
        html,
        to: 'toAddress',
      });
    });

    it('should send a message if no message passed', async () => {
      const opts = {
        hello: 'world',
      };

      expect(await messenger.mail(opts)).toBe(true);

      expect(messengerTransports.emailTransport.sendMail).toBeCalledWith(opts);
    });
  });

  describe('#verifyEmailConnection', () => {
    it('should error if no email transport configured', async () => {
      messenger = new EmailService({});

      try {
        await messenger.verifyEmailConnection();

        throw new Error('invalid');
      } catch (err) {
        expect(err).toEqual(new Error('Email transport not configured'));

        expect(messengerTransports.emailTransport.verify).not.toBeCalled();
      }
    });

    it('should return false from the verification and then throw error', async () => {
      messengerTransports.emailTransport.verify.mockResolvedValue(false);

      try {
        await messenger.verifyEmailConnection();

        throw new Error('invalid');
      } catch (err) {
        expect(err).toEqual(
          new Error('Unable to verify email transport connection')
        );

        expect(messengerTransports.emailTransport.verify).toBeCalledWith();
      }
    });

    it('should return true if verification succeeds', async () => {
      messengerTransports.emailTransport.verify.mockResolvedValue(true);

      expect(await messenger.verifyEmailConnection()).toBe(true);

      expect(messengerTransports.emailTransport.verify).toBeCalledWith();
    });
  });
});
