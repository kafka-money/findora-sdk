import { toWei } from '../../services/bigNumber';
import * as Fee from '../../services/fee';
import { getLedger } from '../../services/ledger/ledgerWrapper';
import { TransactionBuilder } from '../../services/ledger/types';
import { getAddressByPublicKey, getAddressPublicAndKey, LightWalletKeypair, WalletKeypar } from '../keypair';
import * as Network from '../network';
import * as AssetApi from '../sdkAsset';
import * as helpers from './helpers';
import { processeTxInfoList } from './processor';
import { ProcessedTxListResponseResult } from './types';

export interface TransferReciever {
  reciverWalletInfo: WalletKeypar | LightWalletKeypair;
  amount: string;
}

export const getTransactionBuilder = async (): Promise<TransactionBuilder> => {
  const ledger = await getLedger();

  const { response: stateCommitment, error } = await Network.getStateCommitment();

  if (error) {
    throw new Error(error.message);
  }

  if (!stateCommitment) {
    throw new Error('Could not receive response from state commitement call');
  }

  const [_, height] = stateCommitment;
  const blockCount = BigInt(height);

  const transactionBuilder = ledger.TransactionBuilder.new(BigInt(blockCount));

  return transactionBuilder;
};

/**
 * Send some asset to multiple receivers
 *
 * @remarks
 * Using this function, user can transfer perform multiple transfers of the same asset to multiple receivers using different amounts
 *
 * @example
 *
 * ```ts
 * const walletInfo = await Keypair.restoreFromPrivateKey(pkey, password);
 * const toWalletInfoMine2 = await Keypair.restoreFromPrivateKey(toPkeyMine2, password);
 * const toWalletInfoMine3 = await Keypair.restoreFromPrivateKey(toPkeyMine3, password);
 *
 * const assetCode = await Asset.getFraAssetCode();
 *
 * const assetBlindRules: Asset.AssetBlindRules = { isTypeBlind: false, isAmountBlind: false };
 *
 * const recieversInfo = [
 *  { reciverWalletInfo: toWalletInfoMine2, amount: '2' },
 *  { reciverWalletInfo: toWalletInfoMine3, amount: '3' },
 * ];
 *
 * const transactionBuilder = await Transaction.sendToMany(
 *  walletInfo,
 *  recieversInfo,
 *  assetCode,
 *  assetBlindRules,
 * );
 *
 * const resultHandle = await Transaction.submitTransaction(transactionBuilder);
 * ```
 * @throws `Could not create transfer operation (main)`
 * @throws `Could not get transactionBuilder from "getTransactionBuilder"`
 * @throws `Could not add transfer operation`
 * @throws `Could not create transfer operation for fee`
 * @throws `Could not add transfer operation for fee`
 *
 * @returns TransactionBuilder which should be used in `Transaction.submitTransaction`
 */
export const sendToMany = async (
  walletInfo: WalletKeypar,
  recieversList: TransferReciever[],
  assetCode: string,
  assetBlindRules?: AssetApi.AssetBlindRules,
): Promise<TransactionBuilder> => {
  const ledger = await getLedger();

  const asset = await AssetApi.getAssetDetails(assetCode);
  const decimals = asset.assetRules.decimals;

  const recieversInfo: Fee.ReciverInfo[] = [];

  recieversList.forEach(reciver => {
    const { reciverWalletInfo: toWalletInfo, amount } = reciver;
    const toPublickey = ledger.public_key_from_base64(toWalletInfo.publickey);
    const utxoNumbers = BigInt(toWei(amount, decimals).toString());

    const recieverInfoItem = {
      toPublickey,
      utxoNumbers,
      assetBlindRules,
    };

    recieversInfo.push(recieverInfoItem);
  });

  const fraAssetCode = ledger.fra_get_asset_code();

  const isFraTransfer = assetCode === fraAssetCode;

  if (isFraTransfer) {
    const minimalFee = await AssetApi.getMinimalFee();
    const toPublickey = await AssetApi.getFraPublicKey();

    const feeRecieverInfoItem = {
      utxoNumbers: minimalFee,
      toPublickey,
    };

    recieversInfo.push(feeRecieverInfoItem);
  }

  const transferOperationBuilder = await Fee.buildTransferOperation(walletInfo, recieversInfo, assetCode);

  let receivedTransferOperation;

  console.log(transferOperationBuilder.create().transaction());

  try {
    receivedTransferOperation = transferOperationBuilder.create().sign(walletInfo.keypair).transaction();
  } catch (error) {
    const e: Error = error as Error;

    throw new Error(`Could not create transfer operation (main), Error: "${e.message}"`);
  }

  let transactionBuilder;

  try {
    transactionBuilder = await getTransactionBuilder();
  } catch (error) {
    const e: Error = error as Error;

    throw new Error(`Could not get transactionBuilder from "getTransactionBuilder", Error: "${e.message}"`);
  }

  try {
    transactionBuilder = transactionBuilder.add_transfer_operation(receivedTransferOperation);
  } catch (err) {
    const e: Error = err as Error;

    throw new Error(`Could not add transfer operation, Error: "${e.message}"`);
  }

  if (!isFraTransfer) {
    const transferOperationBuilderFee = await Fee.buildTransferOperationWithFee(walletInfo);

    let receivedTransferOperationFee;

    try {
      receivedTransferOperationFee = transferOperationBuilderFee
        .create()
        .sign(walletInfo.keypair)
        .transaction();
    } catch (error) {
      const e: Error = error as Error;

      throw new Error(`Could not create transfer operation for fee, Error: "${e.message}"`);
    }

    try {
      transactionBuilder = transactionBuilder.add_transfer_operation(receivedTransferOperationFee);
    } catch (err) {
      const e: Error = err as Error;

      throw new Error(`Could not add transfer operation for fee, Error: "${e.message}"`);
    }
  }

  return transactionBuilder;
};

/**
 * Submits a transaction
 *
 * @remarks
 * The next step after creating a transaction is submitting it to the ledger, and, as a response, we retrieve the transaction handle.
 *
 * @example
 *
 * ```ts
 * const walletInfo = await Keypair.restoreFromPrivateKey(pkey, password);
 *
 * // First, we create a transaction builder
 * const assetBuilder = await Asset.defineAsset(walletInfo, assetCode);
 *
 * // Then, we submit a transaction
 * // If succcesful, the response of the submit transaction request will return a handle that can be used the query the status of the transaction.
 * const handle = await Transaction.submitTransaction(assetBuilder);
 * ```
 * @throws `Error Could not submit transaction`
 * @throws `Could not submit transaction`
 * @throws `Handle is missing. Could not submit transaction`
 *
 * @returns Transaction status handle
 */
export const submitTransaction = async (transactionBuilder: TransactionBuilder): Promise<string> => {
  const submitData = transactionBuilder.transaction();

  let result;

  try {
    result = await Network.submitTransaction(submitData);
  } catch (err) {
    const e: Error = err as Error;

    throw new Error(`Error Could not submit transaction: "${e.message}"`);
  }

  const { response: handle, error: submitError } = result;

  if (submitError) {
    throw new Error(`Could not submit transaction: "${submitError.message}"`);
  }

  if (!handle) {
    throw new Error(`Handle is missing. Could not submit transaction - submit handle is missing`);
  }

  return handle;
};

/**
 * Send some asset to an address
 *
 * @remarks
 * Using this function, user can transfer some amount of given asset to another address
 *
 * @example
 *
 * ```ts
 *  const walletInfo = await Keypair.restoreFromPrivateKey(pkey, password);
 *  const toWalletInfo = await Keypair.restoreFromPrivateKey(toPkeyMine2, password);
 *
 *  const assetCode = await Asset.getFraAssetCode();
 *
 *  const assetBlindRules: Asset.AssetBlindRules = {
 *    isTypeBlind: false,
 *    isAmountBlind: false
 *  };
 *
 *  const transactionBuilder = await Transaction.sendToAddress(
 *    walletInfo,
 *    toWalletInfo.address,
 *    '2',
 *    assetCode,
 *    assetBlindRules,
 *  );
 *
 *  const resultHandle = await Transaction.submitTransaction(transactionBuilder);
 * ```
 *
 * @returns TransactionBuilder which should be used in `Transaction.submitTransaction`
 */
export const sendToAddress = async (
  walletInfo: WalletKeypar,
  address: string,
  amount: string,
  assetCode: string,
  assetBlindRules?: AssetApi.AssetBlindRules,
): Promise<TransactionBuilder> => {
  const toWalletInfoLight = await getAddressPublicAndKey(address);

  const recieversInfo = [{ reciverWalletInfo: toWalletInfoLight, amount }];

  return sendToMany(walletInfo, recieversInfo, assetCode, assetBlindRules);
};

export const sendToPublicKey = async (
  walletInfo: WalletKeypar,
  publicKey: string,
  amount: string,
  assetCode: string,
  assetBlindRules?: AssetApi.AssetBlindRules,
): Promise<TransactionBuilder> => {
  const address = await getAddressByPublicKey(publicKey);

  return sendToAddress(walletInfo, address, amount, assetCode, assetBlindRules);
};

export const getTxList = async (
  address: string,
  type: 'to' | 'from',
  page = 1,
): Promise<ProcessedTxListResponseResult> => {
  const dataResult = await Network.getTxList(address, type, page);

  if (!dataResult.response) {
    throw new Error('Could not fetch a list of transactions. No response from the server.');
  }

  const txList = helpers.getTxListFromResponse(dataResult);

  if (!txList) {
    throw new Error('Could not get a list of transactions from the server response.');
  }

  const processedTxList = await processeTxInfoList(txList);

  return {
    total_count: dataResult.response.result.total_count,
    txs: processedTxList,
  };
};
