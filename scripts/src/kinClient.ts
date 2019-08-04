import {Environment} from "./environment";
import {KinAccount} from "./kinAccount";
import KeystoreProvider  from "./keystoreProviders/keystoreProviderInterface"
import {
	AccountData,
	Balance,
	OnPaymentListener,
	PaymentListener,
	RawTransaction,
	Transaction
} from "./blockchain/horizonModels";
import {Network, Server} from "@kinecosystem/kin-sdk";
import {AccountDataRetriever} from "./blockchain/accountDataRetriever";
import {Friendbot} from "./friendbot";
import {BlockchainInfoRetriever} from "./blockchain/blockchainInfoRetriever";
import {TransactionRetriever} from "./blockchain/transactionRetriever";
import {Address, TransactionId} from "./types";
import {BlockchainListener} from "./blockchain/blockchainListeners";
import {ANON_APP_ID, GLOBAL_HEADERS, GLOBAL_RETRY} from "./config";

export class KinClient {

	private readonly _server: Server;
	private readonly _accountDataRetriever: AccountDataRetriever;
	private readonly _friendbotHandler: Friendbot | undefined;
	private readonly _blockchainInfoRetriever: BlockchainInfoRetriever;
	private readonly _transactionRetriever: TransactionRetriever;
	private readonly _blockchainListener: BlockchainListener;
	private _kinAccounts: Array<KinAccount> | null 

	constructor(private readonly _environment: Environment, private readonly _keystoreProvider: KeystoreProvider, private readonly _appId?: string) {
		this._environment = _environment;
		this._server = new Server(_environment.url, { allowHttp: false, headers: GLOBAL_HEADERS, retry: GLOBAL_RETRY });
		Network.use(new Network(_environment.passphrase));
		this._accountDataRetriever = new AccountDataRetriever(this._server);
		this._friendbotHandler = _environment.friendbotUrl ? new Friendbot(_environment.friendbotUrl, this._accountDataRetriever) : undefined;
		this._blockchainInfoRetriever = new BlockchainInfoRetriever(this._server);
		this._transactionRetriever = new TransactionRetriever(this._server);
		this._blockchainListener = new BlockchainListener(this._server);
		this._kinAccounts = null
	}

	get kinAccounts(): Promise<Array<KinAccount>> {
		if (this._kinAccounts != null ){
			let kinAccounts: Array<KinAccount> = this._kinAccounts
			return new Promise( (resolve) => resolve(kinAccounts) )
		}
		else {
			let kinAccountsPromise =  this.createKinAccountsPromise(this._keystoreProvider, this._accountDataRetriever, 
					this._server, this._blockchainInfoRetriever, 
					this._appId ? this._appId : ANON_APP_ID)
			kinAccountsPromise.then( (result) => this._kinAccounts = result )
			return kinAccountsPromise
		}
	}

	private createKinAccountsPromise(keystoreProvider: KeystoreProvider, accountDataRetriever: AccountDataRetriever, 
		server: Server, blockchainInfoRetriever: BlockchainInfoRetriever, appId:string): Promise<Array<KinAccount>> {
		return new Promise( (resolve) => {
			this._keystoreProvider.accounts.then(function(result){
				let kinAccounts: Array<KinAccount> = new Array(result.length)
				for (let i=0; i< result.length; i++){
					kinAccounts[i] = new KinAccount(result[i], keystoreProvider, 
						accountDataRetriever, server, blockchainInfoRetriever, appId);
				}
				resolve(kinAccounts)
			})
		})
	}

	get environment() {
		return this._environment;
	}

	// public createKinAccount(params: CreateKinAccountParams): KinAccount {
	// 	return new KinAccount(params.seed, this._accountDataRetriever, this._server, this._blockchainInfoRetriever,
	// 		params.appId ? params.appId : ANON_APP_ID, params.channelSecretKeys);
	// }

	/**
	 * Get the current minimum fee that the network charges per operation.
	 * @returns The fee expressed in Quarks.
	 */
	public getMinimumFee(): Promise<number> {
		return this._blockchainInfoRetriever.getMinimumFee();
	}

	// /**
	//  * Get the current confirmed balance in kin from kin blockchain.
	//  * @param address wallet address (public key)
	//  */
	// public async getAccountBalance(): Promise<Balance> {
	// 	return await this._accountDataRetriever.fetchKinBalance(await this._kinAccount.publicAddress);
	// }

	// /**
	//  * Check if the account exists on kin blockchain.
	//  * @param address wallet address (public key)
	//  */
	// public async isAccountExisting(): Promise<boolean> {
	// 	return await this._accountDataRetriever.isAccountExisting(await this._kinAccount.publicAddress);
	// }

	// /**
	//  * Get detailed data on the account from kin blockchain.
	//  * @param address wallet address (public key)
	//  * @returns an AccountData represent account details
	//  */
	// public async getAccountData(): Promise<AccountData> {
	// 	return await this._accountDataRetriever.fetchAccountData(await this._kinAccount.publicAddress);
	// }

	// /**
	//  * Get transaction data by transaction id from kin blockchain.
	//  * @param transactionId transaction id (hash)
	//  */
	// public async getTransactionData(transactionId: TransactionId): Promise<Transaction> {
	// 	return this._transactionRetriever.fetchTransaction(transactionId);
	// }

	// /**
	//  * Get transaction data by transaction id from kin blockchain.
	//  * @param transactionId transaction id (hash)
	//  * @return RawTransaction only
	//  */
	// public async getRawTransactionData(transactionId: TransactionId): Promise<RawTransaction> {
	// 	return this._transactionRetriever.fetchTransaction(transactionId, false) as Promise<RawTransaction>;
	// }

	// /**
	//  * Get transaction history for a single account from kin blockchain.
	//  * @param params parameters for retrieving transactions
	//  */
	// public async getTransactionHistory(params: TransactionHistoryParams): Promise<Transaction[]> {
	// 	return this._transactionRetriever.fetchTransactionHistory(params);
	// }

	// /**
	//  * Get transaction history for a single account from kin blockchain.
	//  * @param params parameters for retrieving transactions
	//  * @return RawTransaction only
	//  */
	// public async getRawTransactionHistory(params: TransactionHistoryParams): Promise<RawTransaction[]> {
	// 	return this._transactionRetriever.fetchTransactionHistory(params, false) as Promise<RawTransaction[]>;
	// }

	/**
	 * Creates a payment listener for the given addresses.
	 * @return PaymentListener listener object, call `close` to stop listener, `addAddress` to add additional address to listen to
	 */
	public createPaymentListener(params: PaymentListenerParams): PaymentListener {
		return this._blockchainListener.createPaymentsListener(params.onPayment, params.addresses);
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
	channelSecretKeys?: string[];
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
