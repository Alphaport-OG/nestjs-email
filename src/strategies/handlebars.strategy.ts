import { promises as fs } from 'fs';
import * as glob from 'glob';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import * as util from 'util';
import { IKeyValue, IMessageGeneratorStrategy } from '..';
import { IMessageGeneratorOpts } from '../mailer.interface';

export default class HandlebarsStrategy implements IMessageGeneratorStrategy {
  async compile(
    config: IMessageGeneratorOpts,
    template: string,
    params: IKeyValue,
  ): Promise<string> {
    const partials = await HandlebarsStrategy.getPartials(config.templateDir);

    partials.forEach(({ name, content }) => {
      Handlebars.registerPartial(name, content);
    });

    const filePath = path.join(config.templateDir, `${template}.hbs`);
    const file = await HandlebarsStrategy.loadFile(filePath);
    const compileFn = Handlebars.compile(file);

    return compileFn(params);
  }

  static async getPartials(basedir: string) {
    const partialFiles = await util.promisify(glob)(
      path.join(basedir, 'partials', '**/*.hbs'),
    );

    return Promise.all(
      partialFiles.map(async (partial) => {
        const content = await HandlebarsStrategy.loadFile(partial);

        const name = path.basename(partial, '.hbs');

        return {
          name,
          content,
        };
      }),
    );
  }

  static loadFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf8');
  }
}
