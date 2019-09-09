import * as KinCommonSdk from "@kinecosystem/kin-sdk-js-common";
import { KinAccount } from "./kinAccount";
import { GLOBAL_HEADERS } from "./config";

export class KinClient {

	private readonly _server: KinCommonSdk.Server;
	private readonly _accountDataRetriever: KinCommonSdk.AccountDataRetriever;
	private readonly _friendbotHandler: KinCommonSdk.Friendbot | undefined;
	private readonly _blockchainInfoRetriever: KinCommonSdk.BlockchainInfoRetriever;

	constructor(private readonly _environment: KinCommonSdk.Environment, 
		readonly keystoreProvider: KinCommonSdk.KeystoreProvider, private readonly _appId?: string) {
		if (_appId) {
			if (!KinCommonSdk.Config.APP_ID_REGEX.test(_appId)) {
				throw new Error("Invalid app id: " + _appId);
			}
		}
		this._server = new KinCommonSdk.Server(_environment.url, { allowHttp: false, headers: GLOBAL_HEADERS,  retry: KinCommonSdk.Config.GLOBAL_RETRY });
		KinCommonSdk.Network.use(new KinCommonSdk.Network(_environment.passphrase));
		this._accountDataRetriever = new KinCommonSdk.AccountDataRetriever(this._server);
		this._friendbotHandler = _environment.friendbotUrl ? new KinCommonSdk.Friendbot(_environment.friendbotUrl, this._accountDataRetriever) : undefined;
		this._blockchainInfoRetriever = new KinCommonSdk.BlockchainInfoRetriever(this._server);
	}

	/**
	 * Get list of KinAccount
	 * @returns array of KinAccount objects
	 */
	async getkinAccounts(): Promise<KinAccount[]> {
		return new Promise(async resolve => {
			const publicAddresses = await this.keystoreProvider.publicAddresses;
			resolve(publicAddresses.map((address: KinCommonSdk.Address) => new KinAccount(address, this.keystoreProvider,
					this._accountDataRetriever, this._server, 
					this._environment, this._appId)));
			});
		}

	get environment() {
		return this._environment;
	}

	/**
	 * Get the current minimum fee that the network charges per operation.
	 * @returns The fee expressed in Quarks.
	 */
	getMinimumFee(): Promise<number> {
		return this._blockchainInfoRetriever.getMinimumFee();
	}

	/**
	 * Create or fund an account on playground network.
	 * If account already exists it will be funded, o.w. the account will be created with the input amount as starting
	 * balance
	 */
	async friendbot(params: FriendBotParams): Promise<KinCommonSdk.TransactionId> {
		if (!this._friendbotHandler) {
			throw Error("Friendbot url not defined, friendbot is not available on production environment");
		}
		return this._friendbotHandler.createOrFund(params.address, params.amount);
	}
}

export interface FriendBotParams {
	/**
	 * A wallet address to create or fund.
	 */
	address: KinCommonSdk.Address;
	/**
	 * An account starting balance or an amount of kin to fund in case of an existing account.
	 */
	amount: number;
}