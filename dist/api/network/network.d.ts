import * as Types from './types';
export declare const apiPost: (url: string, data?: Types.ParsedTransactionData | undefined, config?: Types.NetworkAxiosConfig | undefined) => Promise<Types.NetworkAxiosDataResult>;
export declare const apiGet: (url: string, config?: Types.NetworkAxiosConfig | undefined) => Promise<Types.NetworkAxiosDataResult>;
export declare const getOwnedSids: (address: string, config?: Types.NetworkAxiosConfig | undefined) => Promise<Types.OwnedSidsDataResult>;
export declare const getRelatedSids: (address: string, config?: Types.NetworkAxiosConfig | undefined) => Promise<Types.OwnedSidsDataResult>;
export declare const getUtxo: (utxoSid: number, config?: Types.NetworkAxiosConfig | undefined) => Promise<Types.UtxoDataResult>;
export declare const getOwnerMemo: (utxoSid: number, config?: Types.NetworkAxiosConfig | undefined) => Promise<Types.OwnerMemoDataResult>;
export declare const getStateCommitment: (config?: Types.NetworkAxiosConfig | undefined) => Promise<Types.StateCommitmentDataResult>;
export declare const getSubmitTransactionData: <T extends string>(data?: T | undefined) => Types.DataResult;
export declare const submitTransaction: <T extends string>(data?: T | undefined, config?: Types.NetworkAxiosConfig | undefined) => Promise<Types.SubmitTransactionDataResult>;
export declare const getAssetToken: (assetCode: string, config?: Types.NetworkAxiosConfig | undefined) => Promise<Types.AssetTokenDataResult>;
export declare const getIssuedRecords: (address: string, config?: Types.NetworkAxiosConfig | undefined) => Promise<Types.IssuedRecordDataResult>;
export declare const getTransactionStatus: (handle: string, config?: Types.NetworkAxiosConfig | undefined) => Promise<Types.TransactionStatusDataResult>;
export declare const getBlock: (height: number, config?: Types.NetworkAxiosConfig | undefined) => Promise<Types.BlockDetailsDataResult>;
export declare const getHashSwap: (hash: string, config?: Types.NetworkAxiosConfig | undefined) => Promise<Types.HashSwapDataResult>;
export declare const getTxList: (address: string, type: 'to' | 'from', page?: number, config?: Types.NetworkAxiosConfig | undefined) => Promise<Types.TxListDataResult>;
export declare const getTransactionDetails: (hash: string, config?: Types.NetworkAxiosConfig | undefined) => Promise<Types.TxDetailsDataResult>;
