targetScope = 'subscription'

@description('Name of the resource group')
param resourceGroupName string = 'rg-fitness-progress'

@description('Azure region for all resources')
param location string = 'eastus2'

@description('Name of the Static Web App')
param staticWebAppName string = 'swa-fitness-progress'

@description('SKU tier for the Static Web App')
@allowed(['Free', 'Standard'])
param sku string = 'Free'

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
}

module staticWebApp 'modules/static-web-app.bicep' = {
  name: 'staticWebApp'
  scope: rg
  params: {
    staticWebAppName: staticWebAppName
    location: location
    sku: sku
  }
}

output staticWebAppDefaultHostname string = staticWebApp.outputs.staticWebAppDefaultHostname
output staticWebAppId string = staticWebApp.outputs.staticWebAppId
