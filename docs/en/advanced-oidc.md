lzcapp Integration with LCMD's OIDC
====================

v1.3.5+ provides unified oidc support. After lzcapp adapts to oidc, it can automatically obtain uid and corresponding permission groups (`ADMIN` represents administrator)

Developers only need to provide the following two pieces of information in manifest.yml to complete the adaptation.

1. Fill in the correct oidc callback address in `application.oidc_redirect_path`
     This path is generally `/oauth2/callback` or `/auth/oidc.callback`,
     you need to check the application's own documentation for specifics. If the application documentation does not provide relevant information, you can fill in any value first,
     when the browser reports an error during login, you can see the actual path used.

2. Get system automatically generated related environment variables through deployment environment variables and pass them to the actual application.
    Required items are `client_id`, `client_secret`.
    Some applications only need to fill in one ISSUER information additionally, and the rest will be automatically detected.
    Some applications need to fill in multiple specific ENDPOINT information. For specific supported information, refer to [Deployment Environment Variables](./advanced-envs#deploy_envs).


::: warning oidc_redirect_path
Only after setting `application.oidc_redirect_path` will the system dynamically generate oidc client-related environment variables

If you don't know what value to fill in, you can fill in any value first. Generally, the application's error page will tell you the correct value.
:::


For example, the OIDC adaptation of the outline application. According to [outline official documentation](https://docs.getoutline.com/s/hosting/doc/oidc-8CPBm6uC0I), the following environment variables need to be set
* `OIDC_CLIENT_ID` – OAuth client ID
* `OIDC_CLIENT_SECRET` – OAuth client secret
* `OIDC_AUTH_URI`
* `OIDC_TOKEN_URI`
* `OIDC_USERINFO_URI`

In manifest.yml, you can fill it like this:
```yml
name: Outline
package: cloud.lazycat.app.outline
version: 0.0.1
application:
  subdomain: outline
  #outline official documentation does not provide this information, but this address can be obtained through error messages
  oidc_redirect_path: /auth/oidc.callback
  routes:
    - /=http://outline.cloud.lazycat.app.outline.lzcapp:3000
services:
  outline:
    image: registry.lazycat.cloud/tx1ee/outlinewiki/outline:fb0e2ef4f32f3601
    environment:
      - OIDC_CLIENT_ID=${LAZYCAT_AUTH_OIDC_CLIENT_ID}
      - OIDC_CLIENT_SECRET=${LAZYCAT_AUTH_OIDC_CLIENT_SECRET}
      - OIDC_AUTH_URI=${LAZYCAT_AUTH_OIDC_AUTH_URI}
      - OIDC_TOKEN_URI=${LAZYCAT_AUTH_OIDC_TOKEN_URI}
      - OIDC_USERINFO_URI=${LAZYCAT_AUTH_OIDC_USERINFO_URI}
```


oidc issuer info
===============

Access `https://$LCMD_NAME.heiyu.space/sys/oauth/.well-known/openid-configuration#/` to get complete issuer information.

Then use `https://$LAZYCAT_BOXDOMAIN/$endpoint_path` to get the address information of any endpoint yourself.


```json
{
"issuer": "https://snyht13.heiyu.space/sys/oauth",
"authorization_endpoint": "https://snyht13.heiyu.space/sys/oauth/auth",
"token_endpoint": "https://snyht13.heiyu.space/sys/oauth/token",
"jwks_uri": "https://snyht13.heiyu.space/sys/oauth/keys",
"userinfo_endpoint": "https://snyht13.heiyu.space/sys/oauth/userinfo",
"device_authorization_endpoint": "https://snyht13.heiyu.space/sys/oauth/device/code",
"introspection_endpoint": "https://snyht13.heiyu.space/sys/oauth/token/introspect",
"grant_types_supported": [
"authorization_code",
"refresh_token",
"urn:ietf:params:oauth:grant-type:device_code",
"urn:ietf:params:oauth:grant-type:token-exchange"
],
"response_types_supported": [
"code"
],
"subject_types_supported": [
"public"
],
"id_token_signing_alg_values_supported": [
"RS256"
],
"code_challenge_methods_supported": [
"S256",
"plain"
],
"scopes_supported": [
"openid",
"email",
"groups",
"profile",
"offline_access"
],
"token_endpoint_auth_methods_supported": [
"client_secret_basic",
"client_secret_post"
],
"claims_supported": [
"iss",
"sub",
"aud",
"iat",
"exp",
"email",
"email_verified",
"locale",
"name",
"preferred_username",
"at_hash"
]
}
```
