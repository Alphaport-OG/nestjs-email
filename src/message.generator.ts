import {
  IKeyValue,
  IMessageGenerator,
  IMessageGeneratorConfig,
} from './mailer.interface';

export default class MessageGenerator implements IMessageGenerator {
  constructor(private readonly config: IMessageGeneratorConfig) {}

  async generate(template: string, params: IKeyValue): Promise<string> {
    /* Generate the template */
    const html = await this.config.engine.compile(
      this.config,
      template,
      params,
    );

    return html;
  }

  previewEnabled(): boolean {
    return this.config.preview ?? false;
  }
}
