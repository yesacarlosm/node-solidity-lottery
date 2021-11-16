const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { abi, evm } = require('../compile');

let lottery, accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object, arguments: [] })
    .send({
      from: accounts[0],
      gas: '1000000'
    });
});

describe('Lottery', () => {
  it('Deploys a contract', () => {
    assert.ok(lottery.options.address);
  });

  it('Player address gets added to the players list when enter lottery', async () => {
    await lottery.methods.enterLottery()
      .send({
        from: accounts[1],
        value: web3.utils.toWei('0.02', 'ether')
      });

    const players = await lottery.methods.getPlayers()
      .call({
        from: accounts[0]
      })
    assert.equal(accounts[1], players[0]);
    assert.equal(1, players.length);
  });

  it('Multiple Player addresses get added to the players list when enter lottery', async () => {
    await lottery.methods.enterLottery()
      .send({
        from: accounts[1],
        value: web3.utils.toWei('0.02', 'ether')
      });

    await lottery.methods.enterLottery()
      .send({
        from: accounts[2],
        value: web3.utils.toWei('0.02', 'ether')
      });

    await lottery.methods.enterLottery()
      .send({
        from: accounts[3],
        value: web3.utils.toWei('0.02', 'ether')
      });

    const players = await lottery.methods.getPlayers()
      .call({
        from: accounts[0]
      })
    assert.equal(accounts[1], players[0]);
    assert.equal(accounts[2], players[1]);
    assert.equal(accounts[3], players[2]);
    assert.equal(3, players.length);
  });

  it('Requires minimum amount of ether to enter the lottery', async () => {
    try {
      await lottery.methods.enterLottery()
        .send({
          from: accounts[0],
          value: 200
        });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it('No one else than the Contract deployer address can trigger PickRandom()', async () => {
    try {
      await lottery.methods.pickWinner()
        .send({
          from: accounts[1]
        });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it('Sends balance to the winner and resets the players list', async () => {
    await lottery.methods.enterLottery()
      .send({
        from: accounts[1],
        value: web3.utils.toWei('2', 'ether')
      });
    
    const previousBalance = await web3.eth.getBalance(accounts[1]);

    await lottery.methods.pickWinner()
    .send({
      from: accounts[0]
    });

    const postWinningBalance = await web3.eth.getBalance(accounts[1]);

    const balanceDifference = postWinningBalance - previousBalance;

    assert(balanceDifference > web3.utils.toWei('1.9', 'ether'));
  });
});