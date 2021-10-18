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
var Integration = __importStar(require("./integration"));
var extendedExecutionTimeout = 60000;
describe('Findora SDK integration (integration test)', function () {
    // describe('Custom Assets', () => {
    //   it(
    //     'Should create a simple transaction to define an asset',
    //     async () => {
    //       const result = await Integration.defineAssetTransaction();
    //       expect(result).toBe(true);
    //     },
    //     extendedExecutionTimeout,
    //   );
    //   it(
    //     'Should define an asset and submit to the network',
    //     async () => {
    //       const result = await Integration.defineAssetTransactionSubmit();
    //       expect(result).toBe(true);
    //     },
    //     extendedExecutionTimeout,
    //   );
    //   it(
    //     'Should define and issue an asset, with submitting transactions to the network',
    //     async () => {
    //       const result = await Integration.defineAndIssueAssetTransactionSubmit();
    //       expect(result).toBe(true);
    //     },
    //     extendedExecutionTimeout * 2,
    //   );
    // });
    describe('Transfer tokens', function () {
        it('Should send FRA to the reciever', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Integration.sendFraTransactionSubmit()];
                    case 1:
                        result = _a.sent();
                        expect(result).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); }, extendedExecutionTimeout * 2);
        it('Should send FRA to multiple recievers', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Integration.sendFraToMultipleReceiversTransactionSubmit()];
                    case 1:
                        result = _a.sent();
                        expect(result).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); }, extendedExecutionTimeout * 2);
        it('Should define, issue and send asset with transactions submitting', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Integration.defineIssueAndSendAssetTransactionSubmit()];
                    case 1:
                        result = _a.sent();
                        expect(result).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); }, extendedExecutionTimeout * 3);
    });
    // describe('Confidentiality', () => {
    //   it(
    //     'Should issue and send confidential asset',
    //     async () => {
    //       const result = await Integration.issueAndSendConfidentialAsset();
    //       expect(result).toBe(true);
    //     },
    //     extendedExecutionTimeout * 4,
    //   );
    // });
    // describe('Account', () => {
    //   it('Should get balance for the account', async () => {
    //     const result = await Integration.getBalance();
    //     expect(result).toBe(true);
    //   }, 5000);
    // });
    // describe('Staking', () => {
    //   it(
    //     'Should get delegate tokens and see some rewards',
    //     async () => {
    //       const result = await Integration.delegateFraTransactionSubmit();
    //       expect(result).toBe(true);
    //     },
    //     extendedExecutionTimeout * 13,
    //   );
    //   it(
    //     'Should get delegate tokens and claim the rewards',
    //     async () => {
    //       const result = await Integration.delegateFraTransactionAndClaimRewards();
    //       expect(result).toBe(true);
    //     },
    //     extendedExecutionTimeout * 25,
    //   );
    // });
});
//# sourceMappingURL=sdk.integration.spec.js.map