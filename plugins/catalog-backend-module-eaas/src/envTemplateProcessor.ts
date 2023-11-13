import { CatalogProcessor, CatalogProcessorEmit, processingResult } from '@backstage/plugin-catalog-node';
import { LocationSpec } from '@backstage/plugin-catalog-common'
import { Entity, getCompoundEntityRef, RELATION_OWNED_BY, RELATION_PART_OF } from '@backstage/catalog-model';

export class EnvTemplateProcessor implements CatalogProcessor {

  // Return processor name
  getProcessorName(): string {
    return 'EnvTemplateProcessor'
  }

  // validateEntityKind is responsible for signaling to the catalog processing
  // engine that this entity is valid and should therefore be submitted for
  // further processing.
  async validateEntityKind(entity: Entity): Promise<boolean> {
    return entity.apiVersion === 'clustertemplate.openshift.io/v1alpha1' &&
        entity.kind === 'Environment'
  }

  async postProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    const selfRef = getCompoundEntityRef(entity);
    emit(
      processingResult.relation({
        source: selfRef,
        type: RELATION_OWNED_BY,
        target: {
          kind: "group",
          namespace: "default",
          name: "guests",
        },
      }),
    );
    emit(
      processingResult.relation({
        source: selfRef,
        type: RELATION_PART_OF,
        target: {
          kind: "system",
          namespace: "default",
          name: "backend-db",
        },
      }),
    );


    return entity;
  }
}