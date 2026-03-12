import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  discoveryApiRef,
  errorApiRef,
  fetchApiRef,
  identityApiRef,
  oauthRequestApiRef,
  storageApiRef,
} from '@backstage/core-plugin-api';
import { OAuth2 } from '@backstage/core-app-api';
import { rhAapAuthApiRef } from '@ansible/plugin-backstage-self-service';
import { UserSettingsStorage } from '@backstage/plugin-user-settings';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: storageApiRef,
    deps: {
      fetchApi: fetchApiRef,
      discoveryApi: discoveryApiRef,
      errorApi: errorApiRef,
      identityApi: identityApiRef,
    },
    factory: ({ fetchApi, discoveryApi, errorApi, identityApi }) =>
      UserSettingsStorage.create({
        fetchApi,
        discoveryApi,
        errorApi,
        identityApi,
      }),
  }),
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
  createApiFactory({
    api: rhAapAuthApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
      oauthRequestApi: oauthRequestApiRef,
      configApi: configApiRef,
    },
    factory: ({ discoveryApi, oauthRequestApi, configApi }) =>
      OAuth2.create({
        configApi,
        discoveryApi,
        oauthRequestApi,
        provider: {
          id: 'rhaap',
          title: 'RH AAP',
          icon: () => null,
        },
        environment: configApi.getOptionalString('auth.environment'),
        defaultScopes: ['read'],
      }),
  }),
];
