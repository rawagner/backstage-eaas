import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const eaasPlugin = createPlugin({
  id: 'eaas',
  routes: {
    root: rootRouteRef,
  },
});

export const EaasPage = eaasPlugin.provide(
  createRoutableExtension({
    name: 'EaasPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
