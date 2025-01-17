/* eslint-disable @typescript-eslint/naming-convention */
const assert = require('assert');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const HDWalletProvider = require('truffle-hdwallet-provider');

const envConfigFile = process.env.RPC_ENV_NAME
  ? `../../../../.env_rpc_${process.env.RPC_ENV_NAME}`
  : `../../../../.env_example`;

const envConfig = require(`${envConfigFile}.json`);

const { rpc: rpcParams } = envConfig;
const { rpcUrl = 'http://127.0.0.1:8545', mnemonic } = rpcParams;

const extendedExecutionTimeout = 40000;

let inbox;
let accounts;
let networkId;

const getPayloadWithGas = from => ({
  gas: '1000000',
  gasPrice: '10000000001',
  from,
  chainId: networkId,
});

describe(`Inbox (contract test) "${rpcUrl}"`, () => {
  const provider = new HDWalletProvider(mnemonic, rpcUrl, 0, mnemonic.length);

  const web3 = new Web3(provider);

  beforeEach(async () => {
    networkId = await web3.eth.net.getId();
    accounts = await web3.eth.getAccounts();

    inbox = await new web3.eth.Contract(JSON.parse(interface))
      .deploy({
        data: bytecode,
        arguments: ['Hi there'],
      })
      .send(getPayloadWithGas(accounts[0]));
  }, extendedExecutionTimeout);

  it(
    'deploys a contract successfully',
    () => {
      assert.ok(inbox.options.address);
    },
    extendedExecutionTimeout,
  );
  it(
    'deploys a contract with a default assigned message',
    async () => {
      const message = await inbox.methods.message().call();
      expect(message).toEqual('Hi there');
    },
    extendedExecutionTimeout,
  );
  it(
    'updates a message with a given value',
    async () => {
      await inbox.methods.setMessage('New Message').send(getPayloadWithGas(accounts[0]));

      const currentMessage = await inbox.methods.message().call();
      expect(currentMessage).toEqual('New Message');
    },
    extendedExecutionTimeout,
  );
});
