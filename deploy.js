require('dotenv').config();
const WalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { abi, evm } = require('./compile');

const provider = new WalletProvider(
  process.env.ACCOUNTS_MNEMONIC,
  process.env.INFURA_URL
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log(`Attempting to deploy from account: ${accounts[0]}`);

  const result = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object, arguments: [] })
    .send({ gas: '1000000', from: accounts[0] });

  console.log(`Contract got deployed to ${result.options.address}`);
  provider.engine.stop();
};

deploy();