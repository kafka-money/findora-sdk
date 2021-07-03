import * as Keypair from '../../keypair';
import { DEFAULT_ASSET_RULES } from '../../../config/asset';

import { DefineAssetOperation, TxOperation } from '../types';

export interface ProcessedDefineAsset {
  defineAsset: DefineAssetOperation;
  from: string[];
  to: string[];
  type: string;
  assetRules: FindoraWallet.IAssetRules;
}

export const processDefineAsset = async (operationItem: TxOperation): Promise<ProcessedDefineAsset> => {
  const operation = operationItem.DefineAsset!;

  const asset = operation.body.asset;

  const from = await Keypair.getAddressByPublicKey(asset.issuer.key);

  const data = {
    defineAsset: operation,
    from: [from],
    assetRules: { ...DEFAULT_ASSET_RULES, ...asset.asset_rules },
    to: [from],
    type: 'defineAsset',
    originalOperation: operationItem,
  };

  return data;
};