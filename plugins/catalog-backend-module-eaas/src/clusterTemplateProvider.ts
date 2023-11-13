import { Entity } from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import {
    CustomObjectsApi,
    CoreV1Api,
  } from '@kubernetes/client-node';


/**
 * Provides entities from fictional frobs service.
 */
export class ClusterTemplateProvider implements EntityProvider {
  private readonly k8sClient: CustomObjectsApi;
  private readonly coreK8sClient: CoreV1Api;
  protected connection?: EntityProviderConnection;

  /** [1] */
  constructor(k8sClient: CustomObjectsApi, coreK8sClient: CoreV1Api) {
    this.k8sClient = k8sClient
    this.coreK8sClient = coreK8sClient
  }

  /** [2] */
  getProviderName(): string {
    return `clustertemplate`;
  }

  /** [3] */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
  }

  /** [4] */
  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    try {
        const result = await this.k8sClient.listNamespacedCustomObject(
            'clustertemplate.openshift.io',
            'v1alpha1',
            'default',
            'clustertemplateinstances',
        );


        const cts = await this.k8sClient.listClusterCustomObject(
          'clustertemplate.openshift.io',
          'v1alpha1',
          'clustertemplates',
        );

        const entities: Entity[] = await Promise.all(((result.body as any).items as any[])
          .map(async (cti) => {
            const ct = ((cts.body as any).items as any[]).find((ct) => ct.metadata.name === cti.spec.clusterTemplateRef);
            let token = "";
            const secretName = cti.status?.adminPassword?.name;
              
            if (secretName) {
              const result = await this.coreK8sClient.readNamespacedSecret(secretName, cti.metadata.namespace)
              /*
              const result = await (this.k8sClient as unknown as CoreV1Api).getnames(
                '',
                'v1',
                cti.metadata.namespace,
                'secrets',
                secretName
              )
              */
              token = (result.body as any).data['token']
            }

            return {
                kind: 'Environment',
                apiVersion: 'clustertemplate.openshift.io/v1alpha1',
                metadata: {
                  name: cti.metadata.name,
                  annotations: {
                      'backstage.io/managed-by-location': 'url:https://host/path',
                      'backstage.io/managed-by-origin-location': 'url:https://host/path'
                  },
                  createdAt: cti.metadata.creationTimestamp,
                  description: cti.metadata.annotations?.description
                },
                spec: {
                  credentials: token ? atob(token) : token,
                  type: ct?.spec?.type || 'cluster',
                  owner: 'guests',
                  status: cti.status?.phase || 'pending',
                  apiURL: cti.status?.apiServerURL,
                  lifecycle:  cti.status?.phase || 'pending',
                  template: "env-demo",
                  appLinks: cti.status.appLinks,
                },
            };
        }))

        /** [6] */
        await this.connection.applyMutation({
        type: 'full',
        entities: entities.map(entity => ({
            entity,
            locationKey: `clustertemplate`,
        })),
        });
    } catch (err) {
        console.log(err)
    }
  }

  async delete(ns: string, name: string) {
    await this.k8sClient.deleteNamespacedCustomObject(
      'clustertemplate.openshift.io',
      'v1alpha1',
      ns,
      'clustertemplateinstances',
      name
    )
    return await this.run()
  }

  async getQuota() {
    const quotas = await this.k8sClient.listNamespacedCustomObject(
      'clustertemplate.openshift.io',
      'v1alpha1',
      'default',
      'clustertemplatequotas',
    );
    const max = ((quotas.body as any).items as any[])[0].spec.allowedTemplates[0].count
    return max;
  }
}