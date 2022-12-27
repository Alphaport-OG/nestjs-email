import { promises as fs } from 'fs';
import * as glob from 'glob';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import HandlebarsGenerator from './handlebars.strategy';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

jest.mock('handlebars', () => ({
  compile: jest.fn(),
  registerPartial: jest.fn(),
}));

jest.mock('glob', () => jest.fn());

describe('Handlebars strategy', () => {
  describe('methods', () => {
    describe('#compile', () => {
      it('should load partials and compile the handlebars template', async () => {
        const obj = new HandlebarsGenerator();

        const { loadFile, getPartials } = HandlebarsGenerator;

        const basedir = '/basedir';
        const template = 'templateName';
        const params = {
          hello: 'world',
        };
        const result = 'output';

        const compileFn = jest.fn().mockReturnValue(result);

        (<any>Handlebars.compile).mockReturnValue(compileFn);
        const files = [
          {
            name: 'file1',
            content: 'content1',
          },
          {
            name: 'file2',
            content: 'content2',
          },
        ];

        const fileContents = 'file content';

        HandlebarsGenerator.loadFile = jest.fn().mockResolvedValue(fileContents);
        HandlebarsGenerator.getPartials = jest.fn().mockResolvedValue(files);

        expect(await obj.compile({ engine: 'handlebars', templateDir: basedir }, template, params)).toEqual(result);

        expect(Handlebars.registerPartial).toHaveBeenCalledTimes(files.length);
        files.forEach(({ name, content }) => {
          expect(Handlebars.registerPartial).toHaveBeenCalledWith(name, content);
        });

        expect(HandlebarsGenerator.loadFile).toBeCalledWith(path.join(basedir, `${template}.hbs`));
        expect(Handlebars.compile).toBeCalledWith(fileContents);

        expect(compileFn).toBeCalledWith(params);

        HandlebarsGenerator.getPartials = getPartials;
        HandlebarsGenerator.loadFile = loadFile;
      });
    });
  });

  describe('static methods', () => {
    describe('#getPartials', () => {
      it('should return a list of partials', async () => {
        const basedir = '/basedir';
        const files = [`${basedir}/file1.hbs`, `${basedir}/dir1/file2.hbs`];

        (<any>glob).mockImplementation((input, cb) => {
          expect(input).toEqual(`${basedir}/partials/**/*.hbs`);
          cb(null, files);
        });

        const orig = HandlebarsGenerator.loadFile;

        HandlebarsGenerator.loadFile = jest.fn().mockImplementation(async (filePath) => `${filePath} content`);

        expect(await HandlebarsGenerator.getPartials(basedir)).toEqual([
          { name: 'file1', content: '/basedir/file1.hbs content' },
          { name: 'file2', content: '/basedir/dir1/file2.hbs content' },
        ]);

        HandlebarsGenerator.loadFile = orig;
      });
    });

    describe('#loadFile', () => {
      it('should load the file as UTF8', async () => {
        (<any>fs).readFile.mockResolvedValue('file');

        const filePath = 'someFilePath';

        expect(await HandlebarsGenerator.loadFile(filePath)).toEqual('file');

        expect(fs.readFile).toBeCalledWith(filePath, 'utf8');
      });
    });
  });
});
