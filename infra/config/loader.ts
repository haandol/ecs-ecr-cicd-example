import * as path from 'path';
import * as joi from 'joi';
import * as toml from 'toml';
import * as fs from 'fs';

interface IService {
  name: string;
  port: number;
  ecrRepositoryName: string;
  codeRepositoryName: string;
}

interface IConfig {
  app: {
    ns: string;
    stage: string;
  };
  aws: {
    region: string;
  };
  vpc?: {
    id: string;
  };
  service: {
    echo: IService;
  };
  user: {
    myip: string;
  };
  notification?: {
    hookUrl: string;
  };
}

const cfg = toml.parse(
  fs.readFileSync(path.resolve(__dirname, '..', '.toml'), 'utf-8')
);
console.log('loaded config', cfg);

const schema = joi
  .object({
    app: joi.object({
      ns: joi.string().required(),
      stage: joi.string().required(),
    }),
    aws: joi.object({
      region: joi.string().required(),
    }),
    vpc: joi
      .object({
        id: joi.string(),
      })
      .optional(),
    service: joi.object({
      echo: joi.object({
        name: joi.string(),
        port: joi.number().port(),
        ecrRepositoryName: joi.string(),
        codeRepositoryName: joi.string(),
      }),
    }),
    user: joi.object({
      myip: joi.string().ip(),
    }),
    notification: joi
      .object({
        hookUrl: joi.string(),
      })
      .optional(),
  })
  .unknown();

const { error } = schema.validate(cfg);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const Config: IConfig = {
  ...cfg,
  app: {
    ...cfg.app,
    ns: `${cfg.app.ns}${cfg.app.stage}`,
  },
};
