import * as config from "./config";
import * as KinCommonSdk from "@kinecosystem/kin-sdk-js-common";

export class KinAccount {
	private readonly _txSender: KinCommonSdk.TxSender;

	constructor(private readonly _publicAddress: KinCommonSdk.Address, _keystoreProvider: KinCommonSdk.KeystoreProvider,
				   private readonly _accountDataRetriever: KinCommonSdk.AccountDataRetriever, server: KinCommonSdk.Server, 
				   private readonly blockchainInfoRetriever: KinCommonSdk.IBlockchainInfoRetriever,
		           private readonly _appId: string = config.ANON_APP_ID) {
		if (!config.APP_ID_REGEX.test(_appId)) {
			throw new Error("Invalid app id: " + _appId);
		}
		this._txSender = new KinCommonSdk.TxSender(_publicAddress, _keystoreProvider, this._appId, server, blockchainInfoRetriever);
	}

	get publicAddress(): KinCommonSdk.Address {
		return this._publicAddress;
	}

	get appId(): string {
		return this._appId;
	}

	public async getBalance(): Promise<KinCommonSdk.Balance> {
		return await this._accountDataRetriever.fetchKinBalance(this._publicAddress);
	}

	async getData(): Promise<KinCommonSdk.AccountData> {
		return await this._accountDataRetriever.fetchAccountData(this._publicAddress);
	}

	public async getTransactionBuilder(param: GetTransactionParams): Promise<KinCommonSdk.TransactionBuilder> {
		return await this._txSender.getTransactionBuilder(param.fee, param.channel);
	}

	public async buildCreateAccount(params: CreateAccountParams): Promise<KinCommonSdk.TransactionBuilder> {
		return await this._txSender.buildCreateAccount(params.address, params.startingBalance, params.fee, params.memoText);
	}

	public async buildTransaction(params: SendKinParams): Promise<KinCommonSdk.TransactionBuilder> {
		return await this._txSender.buildTransaction(params.address, params.amount, params.fee, params.memoText);
	}

	public async submitTransaction(transaction: string): Promise<KinCommonSdk.TransactionId> {
		return await this._txSender.submitTransaction(transaction);
	}

	/**
	 * Check if the account exists on kin blockchain.
	 */
	public async isAccountExisting(): Promise<Boolean> {
		return await this._accountDataRetriever.isAccountExisting(await this._publicAddress);
	}
}

export interface CreateAccountParams {

	/**
	 * Target account address to create.
	 */
	address: KinCommonSdk.Address;
	/**
	 * The starting balance of the created account.
	 */
	startingBalance: number;
	/**
	 * Fee to be deducted for the transaction.
	 */
	fee: number;

	/**
	 * Optional text to put into transaction memo, up to 21 chars.
	 */
	memoText?: string;

	/**
	 * Optional channel to build the transaction with
	 */
	channel?: KinCommonSdk.Channel;
}

export interface SendKinParams {

	/**
	 * Target account address to create.
	 */
	address: KinCommonSdk.Address;
	/**
	 * The amount in kin to send.
	 */
	amount: number;
	/**
	 * Fee to be deducted for the transaction.
	 */
	fee: number;

	/**
	 * Optional text to put into transaction memo, up to 21 chars.
	 */
	memoText?: string;

	/**
	 * Optional channel to build the transaction with
	 */
	channel?: KinCommonSdk.Channel;
}

export interface GetTransactionParams {

	/**
	 * Fee to be deducted for the transaction.
	 */
	fee: number;

	/**
	 * Optional channel to build the transaction with
	 */
	channel?: KinCommonSdk.Channel;
}
