// import { readFile } from 'fs/promises';
import { promises as fsp } from 'fs';
import { compile } from 'handlebars';
import * as mjml2html from 'mjml';
import * as path from 'path';
import { IKeyValue, IMessageGeneratorStrategy } from '..';
import { IMessageGeneratorOpts } from '../mailer.interface';

export default class MjmlStrategy implements IMessageGeneratorStrategy {
  async compile(
    config: IMessageGeneratorOpts,
    template: string,
    params: IKeyValue,
  ): Promise<string> {
    const filePath = path.join(config.templateDir, `${template}.mjml`);

    const compiledTemplated = compile(await fsp.readFile(filePath, 'utf-8'));
    const { html } = mjml2html(compiledTemplated(params), {
      /* Default values */
      keepComments: false,
      minify: false,
      validationLevel: 'strict',
      /* Override with user config */
      ...config.mjmlOpts,
    });

    return html;
  }
}
