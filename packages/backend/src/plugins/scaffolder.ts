import { CatalogClient } from '@backstage/catalog-client';
import { createRouter } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import type { PluginEnvironment } from '../types';
import { createBuiltinActions } from '@backstage/plugin-scaffolder-backend';
import { ScmIntegrations } from '@backstage/integration';
import { createNewEnvironmentAction } from '../../../../plugins/catalog-backend-module-eaas/src/scaffolder/actions/environment';
import {
  CustomObjectsApi,
} from '@kubernetes/client-node';
import { ClusterTemplateProvider } from '../../../../plugins/catalog-backend-module-eaas/src/clusterTemplateProvider';

export default async function createPlugin(
  env: PluginEnvironment,
  k8sClient: CustomObjectsApi,
  ctProvider: ClusterTemplateProvider,
): Promise<Router> {
  const catalogClient = new CatalogClient({ discoveryApi: env.discovery });
  const integrations = ScmIntegrations.fromConfig(env.config);

  const builtInActions = createBuiltinActions({
    integrations,
    catalogClient,
    config: env.config,
    reader: env.reader,
  });

  const actions = [...builtInActions, createNewEnvironmentAction(k8sClient, ctProvider)];

  return createRouter({
    actions,
    catalogClient: catalogClient,
    logger: env.logger,
    config: env.config,
    database: env.database,
    reader: env.reader,
  });
}
