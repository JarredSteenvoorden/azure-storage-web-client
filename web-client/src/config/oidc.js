export const oidcSettings = {
    authority: 'https://your_oidc_authority',
    clientId: 'your_client_id',
    redirectUri: 'http://localhost:1337/oidc-callback',
    responseType: 'id_token token',
    scope: 'openid profile'
  }