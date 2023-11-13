import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { z } from 'zod';
import {
    CustomObjectsApi,
  } from '@kubernetes/client-node';
import { ClusterTemplateProvider } from '../../clusterTemplateProvider';


type CTI = {
    status: {
        conditions: {
          type: string;
          status: string;
          reason: string;  
        }[];
        message: string
    }
}

const envCR = {
    group: 'clustertemplate.openshift.io',
    version: 'v1alpha1',
    namespace: 'default',
    plural: 'clustertemplateinstances',
    body: (name: string, description: string) => ({
        apiVersion: 'clustertemplate.openshift.io/v1alpha1',
        kind: 'ClusterTemplateInstance',
        metadata: {
            name,
            annotations: {
                description,
            }
        },
        spec: {
            clusterTemplateRef: 'nstemplate'
        }
    })
};

const delay = (time: number) => {
    return new Promise(resolve => setTimeout(resolve, time));
} 

export const createNewEnvironmentAction = (k8sClient: CustomObjectsApi, ctProvider: ClusterTemplateProvider) => {
  return createTemplateAction({
    id: 'environment:create',
    schema: {
      input: z.object({
        name: z.string().describe('Name of the environment'),
        description: z.string().describe('Description of the environment'),
      }),
    },

    async handler(ctx) {
        console.log("run")
        try {
            const response = await k8sClient.createNamespacedCustomObject(
                envCR.group,
                envCR.version,
                envCR.namespace,
                envCR.plural,
                envCR.body(ctx.input.name, ctx.input.description)
            );
            console.log(response)
            let isReady = false
            let obj
            while (!isReady) {
                ctx.logger.info('waiting for env to be ready...')
                await delay(2000)
                obj = await k8sClient.getNamespacedCustomObject(
                    envCR.group,
                    envCR.version,
                    envCR.namespace,
                    envCR.plural,
                    ctx.input.name
                );
                isReady = (obj.body as CTI).status?.conditions?.some((c) => c.type === 'NamespaceCredentialsSucceeded' && c.status === 'True')
            }
            await ctProvider.run()
            ctx.logger.info('ready!');
        } catch (err) {
            ctx.logger.error(err);
            console.log(err)
        }
    }
  });
};