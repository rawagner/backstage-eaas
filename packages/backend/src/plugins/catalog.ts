  import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { ClusterTemplateProvider } from '../../../../plugins/catalog-backend-module-eaas/src/clusterTemplateProvider';
import { EnvTemplateProcessor } from '../../../../plugins/catalog-backend-module-eaas/src/envTemplateProcessor';

export default async function createPlugin(
  env: PluginEnvironment,
  ctProvider: ClusterTemplateProvider,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);

  builder.addEntityProvider(ctProvider)

  builder.addProcessor(new ScaffolderEntitiesProcessor());
  builder.addProcessor(new EnvTemplateProcessor());
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();

  await env.scheduler.scheduleTask({
    id: 'run_ct_refresh',
    fn: async () => {
      await ctProvider.run();
    },
    frequency: { seconds: 15 },
    timeout: { minutes: 10 },
  });
  
  return router;
}
