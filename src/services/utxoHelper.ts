import { WalletKeypar } from '../api/keypair';
import * as Network from '../api/network';
import { LedgerUtxo, OwnedMemoResponse, UtxoResponse } from '../api/network/types';
import { CACHE_ENTRIES } from '../config/cache';
import Sdk from '../Sdk';
import Cache from './cacheStore/factory';
import { CacheItem } from './cacheStore/types';
import { getLedger } from './ledger/ledgerWrapper';
import {
  ClientAssetRecord as LedgerClientAssetRecord,
  OwnerMemo as LedgerOwnerMemo,
  TxoRef as LedgerTxoRef,
} from './ledger/types';

export interface LedgerUtxoItem {
  sid: number;
  utxo: LedgerUtxo;
  ownerMemo: LedgerOwnerMemo | undefined;
}

export interface AddUtxoItem extends LedgerUtxoItem {
  address: string;
  body: any;
  memoData: OwnedMemoResponse | undefined;
}

export interface UtxoCacheResponse {
  sid: number;
  utxo: LedgerUtxo;
  address: string;
}

export interface UtxoOutputItem extends LedgerUtxoItem {
  originAmount: BigInt;
  amount: BigInt;
  memoData: OwnedMemoResponse | undefined;
}

export interface UtxoInputParameter {
  txoRef: LedgerTxoRef;
  assetRecord: LedgerClientAssetRecord;
  ownerMemo: LedgerOwnerMemo | undefined;
  amount: BigInt;
  memoData: OwnedMemoResponse | undefined;
}

export interface UtxoInputsInfo {
  inputParametersList: UtxoInputParameter[];
  inputAmount: BigInt;
}

export const decryptUtxoItem = async (
  sid: number,
  walletInfo: WalletKeypar,
  utxoData: UtxoResponse,
  memoData?: OwnedMemoResponse,
): Promise<AddUtxoItem> => {
  const ledger = await getLedger();

  let assetRecord;

  try {
    assetRecord = ledger.ClientAssetRecord.from_json(utxoData.utxo);
  } catch (error) {
    throw new Error(`Can not get client asset record. Details: "${error.message}"`);
  }

  let ownerMemo;

  try {
    ownerMemo = memoData ? ledger.OwnerMemo.from_json(memoData) : null;
  } catch (error) {
    throw new Error(`Can not decode owner memo. Details: "${error.message}"`);
  }

  let decryptAssetData;

  try {
    decryptAssetData = await ledger.open_client_asset_record(
      assetRecord,
      ownerMemo?.clone(),
      walletInfo.keypair,
    );
  } catch (error) {
    throw new Error(`Can not open client asset record to decode. Details: "${error.message}"`);
  }

  let decryptedAsetType;

  try {
    decryptedAsetType = ledger.asset_type_from_jsvalue(decryptAssetData.asset_type);
  } catch (error) {
    throw new Error(`Can not decrypt asset type. Details: "${error.message}"`);
  }

  decryptAssetData.asset_type = decryptedAsetType;

  decryptAssetData.amount = BigInt(decryptAssetData.amount);

  const item = {
    address: walletInfo.address,
    sid,
    body: decryptAssetData || {},
    utxo: { ...utxoData.utxo },
    ownerMemo: ownerMemo?.clone(),
    memoData,
  };

  return item;
};

export const getUtxoItem = async (
  sid: number,
  walletInfo: WalletKeypar,
  cachedItem?: AddUtxoItem,
): Promise<AddUtxoItem> => {
  if (cachedItem) {
    return cachedItem;
  }

  console.log(`Fetching sid "${sid}"`);

  const utxoDataResult = await Network.getUtxo(sid);

  const { response: utxoData, error: utxoError } = utxoDataResult;

  if (utxoError || !utxoData) {
    throw new Error(`Could not fetch utxo data for sid "${sid}", Error - ${utxoError?.message}`);
  }

  const memoDataResult = await Network.getOwnerMemo(sid);

  const { response: memoData, error: memoError } = memoDataResult;

  if (memoError) {
    throw new Error(`Could not fetch memo data for sid "${sid}", Error - ${memoError.message}`);
  }

  const item = await decryptUtxoItem(sid, walletInfo, utxoData, memoData);

  return item;
};

// creates a list of items with descrypted utxo information
export const addUtxo = async (walletInfo: WalletKeypar, addSids: number[]): Promise<AddUtxoItem[]> => {
  const utxoDataList = [];
  const cacheDataToSave: CacheItem = {};
  let utxoDataCache;

  const cacheEntryName = `${CACHE_ENTRIES.UTXO_DATA}_${walletInfo.address}`;
  const fullPathToCacheEntry = `${Sdk.environment.cachePath}/${cacheEntryName}.json`;

  try {
    utxoDataCache = await Cache.read(fullPathToCacheEntry, Sdk.environment.cacheProvider);
  } catch (error) {
    throw new Error(`Error reading the cache, "${error.message}"`);
  }

  for (let i = 0; i < addSids.length; i++) {
    const sid = addSids[i];

    try {
      const item = await getUtxoItem(sid, walletInfo, utxoDataCache?.[`sid_${sid}`]);
      utxoDataList.push(item);
      cacheDataToSave[`sid_${item.sid}`] = item;
    } catch (error) {
      console.log(`could not process addUtxo for sid ${sid}, Details: "${error.message}"`);
      continue;
    }
  }

  try {
    await Cache.write(fullPathToCacheEntry, cacheDataToSave, Sdk.environment.cacheProvider);
  } catch (err) {
    console.log(`could not write cache for utxoData, "${err.message}"`);
  }

  return utxoDataList;
};

// creates a list of utxo like object, which are suitable for the required send operation
export const getSendUtxo = (code: string, amount: BigInt, utxoDataList: AddUtxoItem[]): UtxoOutputItem[] => {
  let balance = amount;

  const result = [];

  for (let i = 0; i < utxoDataList.length; i++) {
    const assetItem = utxoDataList[i];

    if (assetItem.body.asset_type === code) {
      const _amount = BigInt(assetItem.body.amount);

      if (balance <= BigInt(0) || BigInt(_amount) >= balance) {
        result.push({
          amount: balance,
          originAmount: _amount,
          sid: assetItem.sid,
          utxo: { ...assetItem.utxo },
          ownerMemo: assetItem.ownerMemo,
          memoData: assetItem.memoData,
        });
        break;
      } else {
        balance = BigInt(Number(balance) - Number(_amount));
        result.push({
          amount: _amount,
          originAmount: _amount,
          sid: assetItem.sid,
          utxo: { ...assetItem.utxo },
          ownerMemo: assetItem.ownerMemo,
          memoData: assetItem.memoData,
        });
      }
    }
  }

  return result;
};

// creates a list of inputs, which would be used by transaction builder in a fee service
export const addUtxoInputs = async (utxoSids: UtxoOutputItem[]): Promise<UtxoInputsInfo> => {
  const ledger = await getLedger();

  let inputAmount = BigInt(0);

  const inputParametersList = [];

  for (let i = 0; i < utxoSids.length; i += 1) {
    const item = utxoSids[i];

    inputAmount = BigInt(Number(inputAmount) + Number(item.originAmount));

    let assetRecord;

    try {
      assetRecord = ledger.ClientAssetRecord.from_json(item.utxo);
    } catch (error) {
      throw new Error(`Can not get client asset record. Details: "${error.message}"`);
    }

    let txoRef;

    try {
      txoRef = ledger.TxoRef.absolute(BigInt(item.sid));
    } catch (error) {
      throw new Error(`Cannot convert given sid id to a BigInt, "${item.sid}"`);
    }

    const inputParameters: UtxoInputParameter = {
      txoRef,
      assetRecord,
      ownerMemo: item?.ownerMemo,
      amount: item.amount,
      memoData: item.memoData,
    };

    inputParametersList.push(inputParameters);
  }

  const res = { inputParametersList, inputAmount };

  return res;
};

export const getNonEncryptedUtxoItem = async (
  sid: number,
  address: string,
  cachedItem?: UtxoCacheResponse,
): Promise<UtxoCacheResponse> => {
  if (cachedItem) {
    return cachedItem;
  }

  console.log(`Fetching sid "${sid}"`);

  const utxoDataResult = await Network.getUtxo(sid);

  const { response: utxoData, error: utxoError } = utxoDataResult;

  if (utxoError || !utxoData) {
    throw new Error(`Could not fetch utxo data for sid "${sid}", Error - ${utxoError?.message}`);
  }

  const item = {
    address,
    sid,
    utxo: { ...utxoData.utxo },
  };

  return item;
};

export const getUtxoCacheData = async (): Promise<CacheItem> => {
  let utxoDataCache = {};

  const cacheEntryName = `${CACHE_ENTRIES.UTXO_RESPONSE_DATA}_${Sdk.environment.name}`;
  const fullPathToCacheEntry = `${Sdk.environment.cachePath}/${cacheEntryName}.json`;

  try {
    utxoDataCache = await Cache.read(fullPathToCacheEntry, Sdk.environment.cacheProvider);
  } catch (error) {
    const e: Error = error as Error;
    throw new Error(`Error reading the utxo cache "${e.message}"`);
  }

  return utxoDataCache || {};
};

export const getAddressUtxo = async (
  address: string,
  publickey: string,
  sids: number[],
  utxoDataCache: CacheItem,
  updateCache = false,
): Promise<CacheItem> => {
  const utxoCacheData: CacheItem = {};

  const cacheEntryName = `${CACHE_ENTRIES.UTXO_RESPONSE_DATA}_${Sdk.environment.name}`;
  const fullPathToCacheEntry = `${Sdk.environment.cachePath}/${cacheEntryName}.json`;

  for (let i = 0; i < sids.length; i++) {
    const sid = sids[i];
    const addressCacheItem = utxoDataCache?.[`${address}`] || {};
    const sidCacheItem = addressCacheItem?.[`sid_${sid}`];

    try {
      const item = await getNonEncryptedUtxoItem(sid, publickey, sidCacheItem);
      addressCacheItem[`sid_${item.sid}`] = item;
      utxoCacheData[`${address}`] = addressCacheItem;
    } catch (error) {
      const e: Error = error as Error;

      console.log(`could not process getAddressUtxo for sid ${sid}, Details: "${e.message}"`);
      continue;
    }
  }

  if (updateCache) {
    try {
      await Cache.write(
        fullPathToCacheEntry,
        { ...utxoDataCache, ...utxoCacheData },
        Sdk.environment.cacheProvider,
      );
    } catch (error) {
      const e: Error = error as Error;

      console.log(`could not write cache for utxoData, "${e.message}"`);
    }
  }

  return utxoCacheData;
};
