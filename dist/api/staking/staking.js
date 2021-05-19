"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.claim = exports.unDelegate = exports.getFraAssetCode = void 0;
var Fee = __importStar(require("../../services/fee"));
var ledgerWrapper_1 = require("../../services/ledger/ledgerWrapper");
var Network = __importStar(require("../network"));
var getFraAssetCode = function () { return __awaiter(void 0, void 0, void 0, function () {
    var ledger, assetCode;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ledgerWrapper_1.getLedger()];
            case 1:
                ledger = _a.sent();
                assetCode = ledger.fra_get_asset_code();
                return [2 /*return*/, assetCode];
        }
    });
}); };
exports.getFraAssetCode = getFraAssetCode;
var getUnDelegateTransactionBuilder = function (walletKeypair) { return __awaiter(void 0, void 0, void 0, function () {
    var ledger, _a, stateCommitment, error, _, height, blockCount, definitionTransaction;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, ledgerWrapper_1.getLedger()];
            case 1:
                ledger = _b.sent();
                return [4 /*yield*/, Network.getStateCommitment()];
            case 2:
                _a = _b.sent(), stateCommitment = _a.response, error = _a.error;
                if (error) {
                    throw new Error(error.message);
                }
                if (!stateCommitment) {
                    throw new Error('could not receive response from state commitement call');
                }
                _ = stateCommitment[0], height = stateCommitment[1];
                blockCount = BigInt(height);
                definitionTransaction = ledger.TransactionBuilder.new(BigInt(blockCount)).add_operation_undelegate(walletKeypair);
                return [2 /*return*/, definitionTransaction];
        }
    });
}); };
var unDelegate = function (walletInfo) { return __awaiter(void 0, void 0, void 0, function () {
    var fraCode, transferOperationBuilder, receivedTransferOperation, transactionBuilder, error_1, submitData, result, error_2, handle, submitError;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getFraAssetCode()];
            case 1:
                fraCode = _a.sent();
                return [4 /*yield*/, Fee.buildTransferOperationWithFee(walletInfo, fraCode)];
            case 2:
                transferOperationBuilder = _a.sent();
                try {
                    receivedTransferOperation = transferOperationBuilder.create().sign(walletInfo.keypair).transaction();
                }
                catch (error) {
                    throw new Error("Could not create transfer operation, Error: \"" + error.messaage + "\"");
                }
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, getUnDelegateTransactionBuilder(walletInfo.keypair)];
            case 4:
                transactionBuilder = _a.sent();
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                throw new Error("Could not get \"UnDelegateTransactionBuilder\", Error: \"" + error_1.messaage + "\"");
            case 6:
                try {
                    transactionBuilder = transactionBuilder.add_transfer_operation(receivedTransferOperation);
                }
                catch (error) {
                    throw new Error("Could not add transfer operation, Error: \"" + error.messaage + "\"");
                }
                submitData = transactionBuilder.transaction();
                _a.label = 7;
            case 7:
                _a.trys.push([7, 9, , 10]);
                return [4 /*yield*/, Network.submitTransaction(submitData)];
            case 8:
                result = _a.sent();
                return [3 /*break*/, 10];
            case 9:
                error_2 = _a.sent();
                throw new Error("Could not unDelegate : \"" + error_2.message + "\"");
            case 10:
                handle = result.response, submitError = result.error;
                if (submitError) {
                    throw new Error("Could not submit unDelegate transaction: \"" + submitError.message + "\"");
                }
                if (!handle) {
                    throw new Error("Could not unDelegate - submit handle is missing");
                }
                return [2 /*return*/, handle];
        }
    });
}); };
exports.unDelegate = unDelegate;
var getClaimTransactionBuilder = function (walletKeypair, rewords) { return __awaiter(void 0, void 0, void 0, function () {
    var ledger, _a, stateCommitment, error, _, height, blockCount, definitionTransaction;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, ledgerWrapper_1.getLedger()];
            case 1:
                ledger = _b.sent();
                return [4 /*yield*/, Network.getStateCommitment()];
            case 2:
                _a = _b.sent(), stateCommitment = _a.response, error = _a.error;
                if (error) {
                    throw new Error(error.message);
                }
                if (!stateCommitment) {
                    throw new Error('could not receive response from state commitement call');
                }
                _ = stateCommitment[0], height = stateCommitment[1];
                blockCount = BigInt(height);
                definitionTransaction = ledger.TransactionBuilder.new(BigInt(blockCount)).add_operation_claim(walletKeypair, rewords);
                return [2 /*return*/, definitionTransaction];
        }
    });
}); };
var claim = function (walletInfo, amount) { return __awaiter(void 0, void 0, void 0, function () {
    var fraCode, transferOperationBuilder, receivedTransferOperation, transactionBuilder, error_3, submitData, result, error_4, handle, submitError;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getFraAssetCode()];
            case 1:
                fraCode = _a.sent();
                return [4 /*yield*/, Fee.buildTransferOperationWithFee(walletInfo, fraCode)];
            case 2:
                transferOperationBuilder = _a.sent();
                try {
                    receivedTransferOperation = transferOperationBuilder.create().sign(walletInfo.keypair).transaction();
                }
                catch (error) {
                    throw new Error("Could not create transfer operation, Error: \"" + error.messaage + "\"");
                }
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, getClaimTransactionBuilder(walletInfo.keypair, amount)];
            case 4:
                transactionBuilder = _a.sent();
                return [3 /*break*/, 6];
            case 5:
                error_3 = _a.sent();
                throw new Error("Could not get \"claimTransactionBuilder\", Error: \"" + error_3.messaage + "\"");
            case 6:
                try {
                    transactionBuilder = transactionBuilder.add_transfer_operation(receivedTransferOperation);
                }
                catch (error) {
                    throw new Error("Could not add transfer operation, Error: \"" + error.messaage + "\"");
                }
                submitData = transactionBuilder.transaction();
                _a.label = 7;
            case 7:
                _a.trys.push([7, 9, , 10]);
                return [4 /*yield*/, Network.submitTransaction(submitData)];
            case 8:
                result = _a.sent();
                return [3 /*break*/, 10];
            case 9:
                error_4 = _a.sent();
                throw new Error("Could not claim : \"" + error_4.message + "\"");
            case 10:
                handle = result.response, submitError = result.error;
                if (submitError) {
                    throw new Error("Could not submit claim transaction: \"" + submitError.message + "\"");
                }
                if (!handle) {
                    throw new Error("Could not claim - submit handle is missing");
                }
                return [2 /*return*/, handle];
        }
    });
}); };
exports.claim = claim;
//# sourceMappingURL=staking.js.map