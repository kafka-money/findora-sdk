import { Api } from '.';
import { Account, Asset, Keypair, Network, Transaction } from './api';
import Sdk from './Sdk';
import * as bigNumber from './services/bigNumber';
import { FileCacheProvider } from './services/cacheStore/providers';
import * as Fee from './services/fee';
import { getLedger } from './services/ledger/ledgerWrapper';
import * as UtxoHelper from './services/utxoHelper';

const sdkEnv = {
  hostUrl: 'https://dev-staging.dev.findora.org',
  cacheProvider: FileCacheProvider,
  cachePath: './cache',
};

Sdk.init(sdkEnv);

const myFunc1 = async () => {
  const assetCode = await Asset.getFraAssetCode();

  console.log('FRA assetCode IS', assetCode);
};

// define asset
const myFunc2 = async () => {
  // const pkey = '8yQCMZzFRdjm5QK1cYDiBa6yICrE5mt37xl9n8V9MXE=';
  const pkey = 'han9zoCsVi5zISyft_KWDVTwakAX30WgKYHrLPEhsF0=';
  const password = '123';
  console.log('pass!', password);

  const assetCode = await Asset.getRandomAssetCode();

  const walletInfo = await Keypair.restoreFromPrivateKey(pkey, password);

  const asset = await Asset.defineAsset(walletInfo, assetCode);

  console.log('our new asset IS ', asset);
};

// get state commitment
const myFunc3 = async () => {
  // const address = 'mhlYmYPKqBcvhJjvXnapuaZdkzqdz27bEmoxpF0ZG_A=';
  const address = 'gMwGfoP1B98ZRBRFvCJyv48fJLoRgzcoWH4Vd4Acqyk';

  const sidsResult = await Network.getOwnedSids(address);

  console.log('sidsResult', sidsResult);

  const sid = 519;

  const utxo = await Network.getUtxo(sid);

  console.log('utxo!', utxo);

  const ownerMemo = await Network.getOwnerMemo(sid);

  console.log('owner memo', ownerMemo);

  const stateCommitment = await Network.getStateCommitment();

  console.log('stateCommitment', stateCommitment);
};

// get transfer operation with fee
const myFunc4 = async () => {
  const ledger = await getLedger();

  const address = 'gMwGfoP1B98ZRBRFvCJyv48fJLoRgzcoWH4Vd4Acqyk';

  const pkey = '8yQCMZzFRdjm5QK1cYDiBa6yICrE5mt37xl9n8V9MXE=';
  const password = '123';

  const walletInfo = await Keypair.restoreFromPrivateKey(pkey, password);

  const sidsResult = await Network.getOwnedSids(address);

  const { response: sids } = sidsResult;

  console.log('sids', sids);

  if (!sids) {
    return;
  }

  const utxoDataList = await UtxoHelper.addUtxo(walletInfo, sids);

  console.log('utxoDataList', utxoDataList);

  const fraCode = await Asset.getFraAssetCode();

  const amount = BigInt(3);

  const sendUtxoList = UtxoHelper.getSendUtxo(fraCode, amount, utxoDataList);

  console.log('sendUtxoList!', sendUtxoList);

  const utxoInputsInfo = await UtxoHelper.addUtxoInputs(sendUtxoList);

  console.log('utxoInputsInfo!', utxoInputsInfo);

  const minimalFee = ledger.fra_get_minimal_fee();

  const toPublickey = ledger.fra_get_dest_pubkey();

  console.log('toPublickey', toPublickey);

  const publicKeyInString = ledger.public_key_to_base64(toPublickey);
  console.log('publicKeyInString', publicKeyInString);
  const addressInString = ledger.base64_to_bech32(publicKeyInString);
  console.log('addressInString', addressInString);

  const recieversInfo = [
    {
      utxoNumbers: minimalFee,
      toPublickey,
    },
  ];
  const trasferOperation = await Fee.getTransferOperation(
    walletInfo,
    utxoInputsInfo,
    recieversInfo,
    minimalFee,
    fraCode,
  );

  console.log('trasferOperation!', trasferOperation);
};

// get fra balance
const myFunc5 = async () => {
  const address = 'gMwGfoP1B98ZRBRFvCJyv48fJLoRgzcoWH4Vd4Acqyk';

  const pkey = '8yQCMZzFRdjm5QK1cYDiBa6yICrE5mt37xl9n8V9MXE=';
  const password = '123';

  const walletInfo = await Keypair.restoreFromPrivateKey(pkey, password);

  const fraCode = await Asset.getFraAssetCode();

  const sidsResult = await Network.getOwnedSids(address);

  // console.log('sidsResult', sidsResult);

  const { response: sids } = sidsResult;

  console.log('sids!', sids);

  if (!sids) {
    return;
  }

  const balanceInWei = await Account.getAssetBalance(walletInfo, fraCode, sids);

  console.log('balance in wei IS!!', balanceInWei);

  const balance = bigNumber.fromWei(balanceInWei, 6).toFormat(6);

  console.log('balance IS!!!!!', balance);

  const balanceInWeiT = await Account.getAssetBalance(walletInfo, fraCode, sids);

  console.log('balanceT in wei IS!!', balanceInWeiT);

  const balanceT = bigNumber.fromWei(balanceInWeiT, 6).toFormat(6);

  console.log('balance IS!!!!!', balanceT);
};

// get custom asset balance
const myFunc6 = async () => {
  const pkey = 'han9zoCsVi5zISyft_KWDVTwakAX30WgKYHrLPEhsF0=';
  const password = '123';

  const walletInfo = await Keypair.restoreFromPrivateKey(pkey, password);

  const customAssetCode = 'R_WbJ22P5lufAoOlF3kjI3Jgt6va8Afo3G6rZ_4Vjdg=';

  const balance = await Account.getBalance(walletInfo, customAssetCode);

  console.log('balance IS :)', balance);
};

// issue custom asset
const myFunc7 = async () => {
  // const pkey = '8yQCMZzFRdjm5QK1cYDiBa6yICrE5mt37xl9n8V9MXE=';
  // const customAssetCode = 'aRsWc8P6xFqa88S5DhuWJSYTQfmcDQRuSTsaOxv2GeM=';

  const pkey = 'han9zoCsVi5zISyft_KWDVTwakAX30WgKYHrLPEhsF0=';
  const customAssetCode = 'R_WbJ22P5lufAoOlF3kjI3Jgt6va8Afo3G6rZ_4Vjdg=';

  const password = '123';

  const walletInfo = await Keypair.restoreFromPrivateKey(pkey, password);

  const assetBlindRules = { isAmountBlind: false };

  const decimals = 6;

  const handle = await Asset.issueAsset(walletInfo, customAssetCode, 5, assetBlindRules, decimals);

  console.log('our issued tx handle IS  ', handle);
};

// creates a kp
const myFunc8 = async () => {
  const password = '123';

  const walletInfo = await Keypair.createKeypair(password);
  console.log('new wallet info', walletInfo);
};

// send fra
const myFunc9 = async () => {
  const pkey = 'han9zoCsVi5zISyft_KWDVTwakAX30WgKYHrLPEhsF0=';

  const toPkey = 'h9rkZIY4ytl1MbMkEMMlUtDc2gD4KrP59bIbEvcbHFA=';
  const password = '123';

  const walletInfo = await Keypair.restoreFromPrivateKey(pkey, password);
  const toWalletInfo = await Keypair.restoreFromPrivateKey(toPkey, password);

  const fraCode = await Asset.getFraAssetCode();

  const assetCode = fraCode;

  const decimals = 6;

  const assetBlindRules: Api.Asset.AssetBlindRules = { isTypeBlind: false, isAmountBlind: true };

  const resultHandle = await Transaction.sendToAddress(
    walletInfo,
    toWalletInfo.address,
    0.1,
    assetCode,
    decimals,
    assetBlindRules,
  );

  console.log('send fra result handle', resultHandle);
};

// send custom asset
const myFunc10 = async () => {
  const pkey = 'han9zoCsVi5zISyft_KWDVTwakAX30WgKYHrLPEhsF0=';
  const customAssetCode = 'R_WbJ22P5lufAoOlF3kjI3Jgt6va8Afo3G6rZ_4Vjdg=';

  const toPkey = 'h9rkZIY4ytl1MbMkEMMlUtDc2gD4KrP59bIbEvcbHFA=';
  const password = '123';

  const walletInfo = await Keypair.restoreFromPrivateKey(pkey, password);
  const toWalletInfo = await Keypair.restoreFromPrivateKey(toPkey, password);

  const assetCode = customAssetCode;

  const decimals = 6;

  const assetBlindRules: Api.Asset.AssetBlindRules = { isTypeBlind: true, isAmountBlind: false };

  const resultHandle = await Transaction.sendToAddress(
    walletInfo,
    toWalletInfo.address,
    0.1,
    assetCode,
    decimals,
    assetBlindRules,
  );

  console.log('send custom result handle!', resultHandle);

  const resultHandleTwo = await Transaction.sendToPublicKey(
    walletInfo,
    toWalletInfo.publickey,
    0.1,
    assetCode,
    decimals,
    assetBlindRules,
  );

  console.log('send custom result handle 2!', resultHandleTwo);
};

// get custom asset details
const myFunc11 = async () => {
  const customAssetCode = 'R_WbJ22P5lufAoOlF3kjI3Jgt6va8Afo3G6rZ_4Vjdg=';

  const result = await Api.Asset.getAssetDetails(customAssetCode);

  console.log('get custom asset details !', result);

  const h = 'b07040a5d8c9ef6fcb98b95968e6c1f14f77405e851ac8230942e1c305913ea0';

  const txStatus = await Network.getTransactionStatus(h);

  console.log('txStatus!', JSON.stringify(txStatus, null, 2));
};

// send custom asset to many
const myFunc12 = async () => {
  const pkey = 'han9zoCsVi5zISyft_KWDVTwakAX30WgKYHrLPEhsF0=';
  const customAssetCode = 'R_WbJ22P5lufAoOlF3kjI3Jgt6va8Afo3G6rZ_4Vjdg=';

  const toPkey = 'h9rkZIY4ytl1MbMkEMMlUtDc2gD4KrP59bIbEvcbHFA=';
  const password = '123';

  const walletInfo = await Keypair.restoreFromPrivateKey(pkey, password);
  const toWalletInfo = await Keypair.restoreFromPrivateKey(toPkey, password);

  const fraCode = await Asset.getFraAssetCode();

  const assetCode = fraCode;
  // const assetCode = customAssetCode;

  const decimals = 6;

  const assetBlindRules: Api.Asset.AssetBlindRules = { isTypeBlind: false, isAmountBlind: false };

  const recieversInfo = [
    { reciverWalletInfo: toWalletInfo, amount: 0.1 },
    { reciverWalletInfo: toWalletInfo, amount: 0.2 },
  ];

  const resultHandle = await Transaction.sendToMany(
    walletInfo,
    recieversInfo,
    assetCode,
    decimals,
    assetBlindRules,
  );

  console.log('send custom result handle!', resultHandle);
};

// get block details
const myFunc13 = async () => {
  const height = 45;

  const blockDetailsResult = await Network.getBlock(height);

  console.log('blockDetails! :)', JSON.stringify(blockDetailsResult, null, 2));

  const { response } = blockDetailsResult;

  const block = response?.result;
  console.log('block', block?.block.header.height);
};

// get tx hash details
const myFunc14 = async () => {
  const h = 'bfcde17f7e8f0acb746d4efcbd61ed2490ea4e2909922cebec15a6308bab47c2';

  const dataResult = await Network.getHashSwap(h);

  const { response } = dataResult;

  console.log(response?.result.txs);
};

// get tx list hash details
const myFunc15 = async () => {
  const h = 'bfcde17f7e8f0acb746d4efcbd61ed2490ea4e2909922cebec15a6308bab47c2';

  const pkey = 'han9zoCsVi5zISyft_KWDVTwakAX30WgKYHrLPEhsF0=';

  const password = '123';

  const walletInfo = await Keypair.restoreFromPrivateKey(pkey, password);

  const dataResult = await Network.getTxList(walletInfo.address, 'to');

  const { response } = dataResult;

  // console.log('response!', JSON.stringify(response, null, 2));

  console.log('response!!!', response);
  // console.log(response?.result.txs?.[0]);
};

const myFunc16 = async () => {
  const pkey = 'han9zoCsVi5zISyft_KWDVTwakAX30WgKYHrLPEhsF0=';
  const toKey = 'h9rkZIY4ytl1MbMkEMMlUtDc2gD4KrP59bIbEvcbHFA';

  const password = '123';

  const walletInfo = await Keypair.restoreFromPrivateKey(pkey, password);
  const toWalletInfo = await Keypair.restoreFromPrivateKey(pkey, password);

  const txList = await Transaction.getTxList(walletInfo.address, 'from');

  console.log('txList', txList);
};

const myFunc17 = async () => {
  const pkey = 'han9zoCsVi5zISyft_KWDVTwakAX30WgKYHrLPEhsF0=';
  const toKey = 'h9rkZIY4ytl1MbMkEMMlUtDc2gD4KrP59bIbEvcbHFA';

  const password = '123';

  const walletInfo = await Keypair.restoreFromPrivateKey(pkey, password);
  const toWalletInfo = await Keypair.restoreFromPrivateKey(pkey, password);

  const a = await Account.getCreatedAssets(walletInfo.address);

  // const dataResult = await Network.getIssuedRecords(walletInfo.publickey);

  // console.log('dataResult!', dataResult);
};

const myFunc18 = async () => {
  const pkey = 'han9zoCsVi5zISyft_KWDVTwakAX30WgKYHrLPEhsF0=';
  const toKey = 'h9rkZIY4ytl1MbMkEMMlUtDc2gD4KrP59bIbEvcbHFA';

  const password = '123';

  const walletInfo = await Keypair.restoreFromPrivateKey(pkey, password);
  const toWalletInfo = await Keypair.restoreFromPrivateKey(pkey, password);

  // const dataResult = await Network.getRelatedSids(walletInfo.publickey);
  const sids = await Account.getRelatedSids(walletInfo.publickey);

  console.log('sids!!', sids);
};

// myFunc7();

// send custom
// myFunc10();

// send fra
// myFunc9();

// myFunc4();

myFunc18();
// myFunc12();
// myFunc8();
// myFunc7();
