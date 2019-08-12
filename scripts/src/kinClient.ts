import { Environment } from "./environment";
import { KinAccount } from "./kinAccount";
import KeystoreProvider from "./blockchain/keystoreProvider";
import {
	OnPaymentListener,
	PaymentListener
} from "./blockchain/horizonModels";
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
	private _kinAccounts: KinAccount[] | null;

	constructor(private readonly _environment: Environment, private readonly _keystoreProvider: KeystoreProvider, private readonly _appId?: string) {
		this._environment = _environment;
		this._server = new Server(_environment.url, { allowHttp: false, headers: GLOBAL_HEADERS,  retry: GLOBAL_RETRY });
		Network.use(new Network(_environment.passphrase));
		this._accountDataRetriever = new AccountDataRetriever(this._server);
		this._friendbotHandler = _environment.friendbotUrl ? new Friendbot(_environment.friendbotUrl, this._accountDataRetriever) : undefined;
		this._blockchainInfoRetriever = new BlockchainInfoRetriever(this._server);
		this._kinAccounts = null;
	}

	get kinAccounts(): Promise<KinAccount[]> {
		if (this._kinAccounts != null) {
			return Promise.resolve(this._kinAccounts);
		} else {
			return new Promise(resolve => {
				this._keystoreProvider.accounts.then(accounts => {
					resolve(accounts.map(account => new KinAccount(account, this._keystoreProvider,
						this._accountDataRetriever, this._server, this._blockchainInfoRetriever, this._appId)));
				});
			});
		}
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

/**
 * Parameters for getting transaction history
 */
export interface TransactionHistoryParams {

	/**
	 * Target account address for getting the history for.
	 */
	address: Address;
	/**
	 * Maximum count of transactions to retrieve.
	 */
	limit?: number;
	/**
	 * Order based on timestamp
	 */
	order?: "asc" | "desc";
	/**
	 * Optional cursor
	 */
	cursor?: string;
}

export interface PaymentListenerParams {

	/**
	 * Payment callback listener method, will be triggered when payment was happened.
	 */
	onPayment: OnPaymentListener;

	/**
	 * List of addresses to listen for payments.
	 */
	addresses: Address[];
}

export interface CreateKinAccountParams {
	seed: string;
	appId?: string;
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
