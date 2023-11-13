import * as React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  InfoCard,
  Header,
  Page,
  Content,
  Link,
  HeaderActionMenu,
} from '@backstage/core-components';

import { Grid, TextField,
  InputAdornment,
  IconButton,
  OutlinedInput,
  Link as MLink,
} from '@material-ui/core';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

import { VisibilityOff, Visibility } from '@material-ui/icons';
import { useNavigate } from 'react-router-dom';

export const EaasDetailsPage = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const { entity } = useEntity();
  const config = useApi(configApiRef);
  const backendUrl = config.getString('backend.baseUrl');
  const navigate = useNavigate()
  return (
    <Page themeId="tool">
      <Header title={entity.metadata.name}>
        <HeaderActionMenu actionItems={[{
          label: "Delete",
          onClick: async () => {
            await fetch(`${backendUrl}/api/environment/${entity.metadata.namespace}/${entity.metadata.name}`, {
              method: 'DELETE',
            })
            navigate(-1)
          }
        }]} />
      </Header>
      <Content>
        <Grid container spacing={3} alignItems="stretch">
          <Grid item md={12}>
            <InfoCard title="Details">
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <div><b>Name</b></div>
                  <div>{entity.metadata.name}</div>
                </Grid>
                <Grid item xs={2}>
                    <div><b>Status</b></div>
                    <div>{entity.spec?.status || ''}</div>
                </Grid>
                <Grid item xs={3}>
                    <div><b>Type</b></div>
                    <div>{entity.spec?.type}</div>
                </Grid>
                <Grid item xs={2}>
                    <div><b>Created</b></div>
                    <div>{entity.metadata.createdAt}</div>
                </Grid>
                <Grid item xs={2}>
                    <div><b>Template</b></div>
                    <div>
                      <Link to={`/catalog/default/template/${entity.spec?.template}`}>
                        {entity.spec?.template}
                      </Link>
                    </div>
                </Grid>
              </Grid>
            </InfoCard>
          </Grid>
          <Grid item md={12}>
            <InfoCard title="Credentials">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <MLink onClick={() => navigator.clipboard.writeText(`oc login ${entity.spec?.apiURL} --token ${entity.spec?.credentials}`)}>
                    Copy login command
                  </MLink>
                </Grid>
                <Grid item xs={12}>
                  <div><b>Login token</b></div>
                  <OutlinedInput
                    //InputProps={{ readOnly: true }}
                    value={entity.spec?.credentials}
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          onMouseDown={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <div><b>API URL</b></div>
                  <TextField
                    variant="outlined" 
                    InputProps={{ readOnly: true }}
                    value={entity.spec?.apiURL}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <div><b>APP URL</b></div>
                  <TextField
                    variant="outlined" 
                    InputProps={{ readOnly: true }}
                    value={(entity.spec?.appLinks as any[])?.[0]}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  )
}