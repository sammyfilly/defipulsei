/*==================================================
  Modules
  ==================================================*/

  const _ = require('underscore');
  const sdk = require('../../sdk');
  const BigNumber = require("bignumber.js");

/*==================================================
  Settings
  ==================================================*/

  const zeroAddress = '0x0000000000000000000000000000000000000000'
  const acceptableTokens = [
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
    '0x0d8775f648430679a709e98d2b0cb6250d2887ef', // BAT
  ]

/*==================================================
  TVL
  ==================================================*/

  async function getFundBalances(block, timestamp) {
    let calls = [];
    let balances = {};
    let fundContract = '0x07cDB44fA1E7eCEb638c12A3451A3Dc9CE1400e4'

    if (block <= 12225121)
    {
      fundContract = "0x6DE5673d00D42323Fb2E7F34ADcA156280370876";
    }
    else if (block <= 13054404)
    {
      fundContract = "0xaf5a490c02efd2dbc6c5d1af0c61d1470b5ed478";
    }
    else
    {
      fundContract = '0x07cDB44fA1E7eCEb638c12A3451A3Dc9CE1400e4';
    }
    _.each(acceptableTokens, (tokenAddress) => {
      calls.push({
        target: tokenAddress,
        params: fundContract
      })
    });

    const balanceOfResults = await sdk.api.abi.multiCall({
      block,
      calls,
      abi: 'erc20:balanceOf'
    });

    sdk.util.sumMultiBalanceOf(balances, balanceOfResults);

    // Fetch ETH balance
    let balance = (await sdk.api.eth.getBalance({target: fundContract, block})).output;
    balances[zeroAddress] = BigNumber(balances[zeroAddress] || 0).plus(balance).toFixed();

    return balances;
  }

  async function tvl(timestamp, block) {
    const balances = await getFundBalances(block, timestamp);
    return (await sdk.api.util.toSymbols(balances)).output;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'PEAKDEFI',         // Peakdefi
    token: 'PEAK',            // PEAK token
    category: 'Assets',       // Allowed values as shown on DefiPulse: 'Derivatives', 'DEXes', 'Lending', 'Payments', 'Assets'
    start: 1607405152,        // Dec-08-2020 05:25:52 PM +UTC
    tvl                       // Tvl adapter
  }
