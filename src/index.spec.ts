import * as index from './index';
import EmailService from './mail.service';
import EmailModule from './mailer.module';
import MessageGenerator from './message.generator';

describe('Index', () => {
  it('should expose all public classes and interfaces', () => {
    expect(index.MessageGenerator).toBe(MessageGenerator);
    expect(index.EmailModule).toBe(EmailModule);
    expect(index.EmailService).toBe(EmailService);
  });
});
