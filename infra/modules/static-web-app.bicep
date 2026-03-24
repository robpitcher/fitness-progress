@description('Name of the Static Web App')
param staticWebAppName string

@description('Azure region for the Static Web App')
param location string

@description('SKU tier for the Static Web App')
@allowed(['Free', 'Standard'])
param sku string = 'Free'

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: sku
    tier: sku
  }
  properties: {
    buildProperties: {
      appLocation: '/'
      outputLocation: 'dist'
      apiLocation: ''
    }
  }
}

output staticWebAppDefaultHostname string = staticWebApp.properties.defaultHostname
output staticWebAppId string = staticWebApp.id

#disable-next-line outputs-should-not-contain-secrets
output deploymentToken string = staticWebApp.listSecrets().properties.apiKey
