import {
	Server,
	AccountDataRetriever,
	Friendbot,
	BlockchainInfoRetriever,
	Environment,
	KeystoreProvider,
	Config,
	Network,
	TransactionId,
	Address
} from "@kinecosystem/kin-sdk-js-common";
import { KinAccount } from "./kinAccount";
import { GLOBAL_HEADERS } from "./config";

export class KinClient {
	private readonly _server: Server;
	private readonly _accountDataRetriever: AccountDataRetriever;
	private readonly _friendbotHandler: Friendbot | undefined;
	private readonly _blockchainInfoRetriever: BlockchainInfoRetriever;

	constructor(private readonly _environment: Environment, readonly keystoreProvider: KeystoreProvider, private readonly _appId?: string) {
		if (_appId) {
			if (!Config.APP_ID_REGEX.test(_appId)) {
				throw new Error("Invalid app id: " + _appId);
			}
		}
		this._server = new Server(_environment.url, { allowHttp: false, headers: GLOBAL_HEADERS, retry: Config.GLOBAL_RETRY });
		Network.use(new Network(_environment.passphrase));
		this._accountDataRetriever = new AccountDataRetriever(this._server);
		this._friendbotHandler = _environment.friendbotUrl ? new Friendbot(_environment.friendbotUrl, this._accountDataRetriever) : undefined;
		this._blockchainInfoRetriever = new BlockchainInfoRetriever(this._server);
	}

	/**
   * Get list of KinAccount
   * @returns array of KinAccount objects
   */
	public async getAccounts(): Promise<KinAccount[]> {
		return new Promise(async resolve => {
			const publicAddresses = await this.keystoreProvider.publicAddresses;
			resolve(
				publicAddresses.map(
					(address: Address) =>
						new KinAccount(address, this.keystoreProvider, this._accountDataRetriever, this._server, this._environment, this._appId)
				)
			);
		});
	}

	get environment() {
		return this._environment;
	}

	/**
   * Get the current minimum fee that the network charges per operation.
   * @returns The fee expressed in Quarks.
   */
	public getMinimumFee(): Promise<number> {
		return this._blockchainInfoRetriever.getMinimumFee();
	}

	/**
   * Create or fund an account on playground network.
   * If account already exists it will be funded, o.w. the account will be created with the input amount as starting
   * balance
   */
	public async friendbot(params: FriendBotParams): Promise<TransactionId> {
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
	address: Address;
	/**
   * An account starting balance or an amount of kin to fund in case of an existing account.
   */
	amount: number;
}
