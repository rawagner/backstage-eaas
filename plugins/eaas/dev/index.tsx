import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { eaasPlugin, EaasPage } from '../src/plugin';

createDevApp()
  .registerPlugin(eaasPlugin)
  .addPage({
    element: <EaasPage />,
    title: 'Root Page',
    path: '/eaas'
  })
  .render();
