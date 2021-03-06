const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

const { t } = require('typy');

function getNetworkNameForSubgraph() {
  switch (process.env.SUBGRAPH) {
    case undefined:
    case 'thomas-waite/Cover':
      return 'mainnet';
    case 'thomas-waite/Cover-goerli':
      return 'goerli';
    case 'thomas-waite/Cover-kovan':
      return 'kovan';
    case 'thomas-waite/Cover-rinkeby':
      return 'rinkeby';
    case 'thomas-waite/Cover-ropsten':
      return 'ropsten';
    case 'thomas-waite/Cover-local':
      return 'local';
    default:
      return null;
  }
}

(async () => {
  const networkName = process.env.NETWORK_NAME || getNetworkNameForSubgraph();
  const addressesDirectory = path.join(
    __dirname,
    '../contract-artifacts/addresses/',
  );
  const addressesFilePath = path.join(
    addressesDirectory,
    `${networkName}.json`,
  );
  const addresses = JSON.parse(
    await fs.readFile(addressesFilePath, { encoding: 'utf-8' }),
  );

  const networksFilePath = path.join(__dirname, 'networks.yaml');

  const networks = yaml.load(
    await fs.readFile(networksFilePath, { encoding: 'utf-8' }),
  );

  const network = t(networks, networkName).safeObject;
  if (t(network).isFalsy) {
    throw new Error(
      'Please set either a "NETWORK_NAME" or a "SUBGRAPH" environment variable',
    );
  }

  network.contracts.Options.address = addresses.Options;
  await fs.writeFile(networksFilePath, yaml.safeDump(networks));

  // eslint-disable-next-line no-console
  console.log('🎉 networks.yaml successfully updated');
})();
