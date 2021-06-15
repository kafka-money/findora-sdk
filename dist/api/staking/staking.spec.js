"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@testing-library/jest-dom/extend-expect");
var msw_1 = require("msw");
var node_1 = require("msw/node");
var __1 = require("..");
var cache_1 = require("../../config/cache");
var Sdk_1 = __importDefault(require("../../Sdk"));
var factory_1 = __importDefault(require("../../services/cacheStore/factory"));
var providers_1 = require("../../services/cacheStore/providers");
var staking_1 = require("./staking");
var myDefaultResult = [
    {
        foo: 'bar',
    },
    {
        barfoo: 'foobar',
    },
];
var defaultUrl = "https://foo.com";
var server = node_1.setupServer(msw_1.rest.get(defaultUrl, function (_req, res, ctx) {
    return res(ctx.json(myDefaultResult));
}));
beforeAll(function () { return server.listen(); });
afterEach(function () { return server.resetHandlers(); });
afterAll(function () { return server.close(); });
describe('sdkAsset', function () {
    var pkey = '8yQCMZzFRdjm5QK1cYDiBa6yICrE5mt37xl9n8V9MXE=';
    var password = '123';
    var hostUrl = 'https://foo.bar';
    var globalState = [1, 234];
    var sdkEnv = {
        hostUrl: hostUrl,
        cacheProvider: providers_1.MemoryCacheProvider,
        cachePath: '.',
    };
    Sdk_1.default.init(sdkEnv);
    var sids = [
        419,
        339,
        501,
        1094,
        755,
        1086,
        465,
        526,
        627,
        264,
        483,
        610,
        992,
        998,
        1066,
        1089,
        659,
        619,
        553,
        562,
        1048,
        538,
        1051,
        1054,
        459,
        454,
        585,
        680,
        702,
        734,
        1092,
        466,
        601,
        513,
        460,
        344,
        471,
        922,
        447,
        453,
        544,
        507,
        618,
        495,
        1083,
        780,
        930,
        580,
        995,
        1045,
        569,
        426,
        1057,
        354,
        1077,
        382,
        502,
        576,
        561,
        477,
        519,
        484,
        448,
        592,
        1060,
        1063,
        637,
        586,
        329,
        508,
        570,
        712,
        1080,
        520,
        472,
        531,
        537,
        489,
        490,
        496,
        1091,
        1079,
        514,
        478,
        525,
        532,
        334,
    ];
    describe('staking', function () {
        it('staking unDelegate', function () { return __awaiter(void 0, void 0, void 0, function () {
            var walletInfo, getSidsUrl, postUrl, globalStateUrl, myResponse, utxoDataCache, handle;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, __1.Keypair.restoreFromPrivateKey(pkey, password)];
                    case 1:
                        walletInfo = _a.sent();
                        getSidsUrl = hostUrl + ":8667/get_owned_utxos/" + walletInfo.publickey;
                        postUrl = hostUrl + ":8669/submit_transaction";
                        globalStateUrl = hostUrl + ":8668/global_state";
                        myResponse = 'f6efc414f09f30a0e69cad8da9ac87b97860d2e5019c8e9964cbc208ff856e3b';
                        server.use(msw_1.rest.get(getSidsUrl, function (_req, res, ctx) {
                            return res(ctx.json(sids));
                        }), msw_1.rest.get(globalStateUrl, function (_req, res, ctx) {
                            return res(ctx.json(globalState));
                        }), msw_1.rest.post(postUrl, function (_req, res, ctx) {
                            return res(ctx.json(myResponse));
                        }));
                        return [4 /*yield*/, factory_1.default.read("./test_utxo_fixture_list.json", providers_1.FileCacheProvider)];
                    case 2:
                        utxoDataCache = _a.sent();
                        return [4 /*yield*/, factory_1.default.write("./" + cache_1.CACHE_ENTRIES.UTXO_DATA + "_" + walletInfo.address + ".json", utxoDataCache, providers_1.MemoryCacheProvider)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, staking_1.unDelegate(walletInfo)];
                    case 4:
                        handle = _a.sent();
                        expect(handle).toBe(myResponse);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=staking.spec.js.map