import 'dotenv/config';

export default {
  runtime: {
    port: parseInt(process.env.WORKBENCH_PORT || '3000'),
  },
  logging: {
    level: (process.env.LOG_LEVEL || 'info') as
      | 'debug'
      | 'info'
      | 'warn'
      | 'error',
  },
};
