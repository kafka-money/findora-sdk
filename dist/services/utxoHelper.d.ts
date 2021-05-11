import { WalletKeypar } from '_src/api/keypair';
import { LedgerUtxo, OwnedMemoResponse, UtxoResponse } from '_src/api/network/types';
import { ClientAssetRecord as LedgerClientAssetRecord, OwnerMemo as LedgerOwnerMemo, TxoRef as LedgerTxoRef } from '_src/services/ledger/types';
export interface LedgerUtxoItem {
    sid: number;
    utxo: LedgerUtxo;
    ownerMemo: LedgerOwnerMemo | undefined;
}
export interface AddUtxoItem extends LedgerUtxoItem {
    address: string;
    body: any;
}
export interface UtxoOutputItem extends LedgerUtxoItem {
    originAmount: BigInt;
    amount: BigInt;
}
export interface UtxoInputParameter {
    txoRef: LedgerTxoRef;
    assetRecord: LedgerClientAssetRecord;
    ownerMemo: LedgerOwnerMemo | undefined;
    amount: BigInt;
}
export interface UtxoInputsInfo {
    inputParametersList: UtxoInputParameter[];
    inputAmount: BigInt;
}
export declare const decryptUtxoItem: (sid: number, walletInfo: WalletKeypar, utxoData: UtxoResponse, memoData?: OwnedMemoResponse | undefined) => Promise<AddUtxoItem>;
export declare const getUtxoItem: (sid: number, walletInfo: WalletKeypar, cachedItem?: AddUtxoItem | undefined) => Promise<AddUtxoItem>;
export declare const addUtxo: (walletInfo: WalletKeypar, addSids: number[]) => Promise<AddUtxoItem[]>;
export declare const getSendUtxo: (code: string, amount: BigInt, utxoDataList: AddUtxoItem[]) => UtxoOutputItem[];
export declare const addUtxoInputs: (utxoSids: UtxoOutputItem[]) => Promise<UtxoInputsInfo>;
