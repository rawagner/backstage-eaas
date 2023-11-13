import { coreServices, createBackendModule } from '@backstage/backend-plugin-api';

export const catalogModuleEaas = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'eaas',
  register(reg) {
    reg.registerInit({
      deps: { logger: coreServices.logger },
      async init({ logger }) {
        logger.info('Hello World!')
      },
    });
  },
});
