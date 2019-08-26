import { Environment } from "./environment";
import { KinAccount } from "./kinAccount";
import KeystoreProvider from "./blockchain/keystoreProvider";
import { Network, Server } from "@kinecosystem/kin-sdk";
import { AccountDataRetriever } from "./blockchain/accountDataRetriever";
import { Friendbot } from "./friendbot";
import { BlockchainInfoRetriever } from "./blockchain/blockchainInfoRetriever";
import { Address, TransactionId } from "./types";
import { GLOBAL_HEADERS, GLOBAL_RETRY } from "./config";

export class KinClient {

	private readonly _server: Server;
	private readonly _accountDataRetriever: AccountDataRetriever;
	private readonly _friendbotHandler: Friendbot | undefined;
	private readonly _blockchainInfoRetriever: BlockchainInfoRetriever;

	constructor(private readonly _environment: Environment,  readonly keystoreProvider: KeystoreProvider, private readonly _appId?: string) {
		this._server = new Server(_environment.url, { allowHttp: false, headers: GLOBAL_HEADERS,  retry: GLOBAL_RETRY });
		Network.use(new Network(_environment.passphrase));
		this._accountDataRetriever = new AccountDataRetriever(this._server);
		this._friendbotHandler = _environment.friendbotUrl ? new Friendbot(_environment.friendbotUrl, this._accountDataRetriever) : undefined;
		this._blockchainInfoRetriever = new BlockchainInfoRetriever(this._server);
	}

	get kinAccounts(): Promise<KinAccount[]> {
		return new Promise(async resolve => {
			const accounts = await this.keystoreProvider.accounts;
			resolve(accounts.map(account => new KinAccount(account, this.keystoreProvider,
					this._accountDataRetriever, this._server, this._blockchainInfoRetriever, this._appId)));
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
