import {
  CoreV1Api,
    CustomObjectsApi,
    KubeConfig,
  } from '@kubernetes/client-node';
  import { Config } from '@backstage/config';

export const hubApiClient = (
  config: Config
  ): [CustomObjectsApi, CoreV1Api] => {
    const clusterConfig = config.getConfig('kubernetes').getConfigArray('clusterLocatorMethods')[0].getConfigArray('clusters')[0]
    const token = clusterConfig.getString('serviceAccountToken');
    const apiURL = clusterConfig.getString('url')
    const kubeConfig = new KubeConfig();
  
    const user = {
      name: 'backstage',
      token: token,
    }
  
    const context = {
      name: 'rw4',
      user: user.name,
      cluster: 'rw4',
    };
  
    kubeConfig.loadFromOptions({
      clusters: [
        {
          server: apiURL,
          name: 'rw4',
          skipTLSVerify: true,
        },
      ],
      users: [user],
      contexts: [context],
      currentContext: context.name,
    });
    return [kubeConfig.makeApiClient(CustomObjectsApi), kubeConfig.makeApiClient(CoreV1Api)];
  };