import * as React from 'react';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import {
  InfoCard,
  Link,
  PageWithHeader,
  Content,
  ContentHeader,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

import { Grid, Button } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';


export const ComponentEnvironmentsPage = () => {
  const { entity } = useEntity()
  const catalogApi = useApi(catalogApiRef);
  const [entities, setEntities] = React.useState<any[]>([])
  const config = useApi(configApiRef);
  const backendUrl = config.getString('backend.baseUrl');
  const [quotaLoading, setQuotaLoading] = React.useState(true)
  const [quota, setQuota] = React.useState<number>(0)
  React.useEffect(() => {
    const run = async () => {
        const response = await catalogApi.getEntities();
        setEntities(response.items)
    }
    run()
  }, [])

  React.useEffect(() => {
    const run = async () => {
      const response = await fetch(`${backendUrl}/api/environment/${entity.metadata.namespace}`)
      setQuotaLoading(false)
      const quota = await response.json()
      setQuota(quota.max)
    }
    run()
  })

  const envs = entities.filter((e) => e.kind === "Environment")

  let title = "Environments - loading quota"
  if (!quotaLoading) {
    if (quota > 0) {
      title = `Environments ${envs.length}/${quota}`
    } else {
      title = "Environments"
    }
  }
    
  return (
    <PageWithHeader title="Environments" themeId="home">
      <Content>
        <ContentHeader title="">
        <Button
          component={RouterLink}
          variant="contained"
          color="primary"
          to="/create/templates/default/env-demo"
          disabled={quota <= envs.length}
        >
          Create new environment
        </Button>
        </ContentHeader>
    <InfoCard title={title}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <div><b>Name</b></div>
          {envs.map((e) => (
            <div style={{ paddingTop: '1rem' }}>
              <Link to={`/catalog/default/environment/${e.metadata.name}`}>
                {e.metadata.name}
              </Link>
            </div>
          ))}
          
        </Grid>
        <Grid item xs={2}>
            <div><b>Status</b></div>
            {envs.map((e) => (
              <div style={{ paddingTop: '1rem' }}>{e.spec?.status || ''}</div>
            ))}
        </Grid>
        <Grid item xs={3}>
            <div><b>Type</b></div>
            {envs.map((e) => (
              <div style={{ paddingTop: '1rem' }}>{e.spec?.type || ''}</div>
            ))}
        </Grid>
        <Grid item xs={2}>
            <div><b>Created</b></div>
            {envs.map((e) => (
              <div style={{ paddingTop: '1rem' }}>{e.metadata?.createdAt || ''}</div>
            ))}
        </Grid>
        <Grid item xs={2}>
            <div><b>Template</b></div>
            {envs.map((e) => (
              <div style={{ paddingTop: '1rem' }}>
              <Link to={`/catalog/default/template/${e.spec?.template}`}>
                {e.spec?.template}
              </Link>
            </div>
            ))}
            
        </Grid>
      </Grid>
    </InfoCard>
    </Content>
    </PageWithHeader>
      
  )
}