import * as config from "./config";
import * as KinCommonSdk from "@kinecosystem/kin-sdk-js-common";
import {Address, Balance, AccountData, PaymentTransactionParams, TransactionInterceptor } from "@kinecosystem/kin-sdk-js-common";

export class KinAccount {
	private readonly _txSender: KinCommonSdk.TxSender;

	constructor(private readonly _publicAddress: KinCommonSdk.Address, 
				keyStoreProvider: KinCommonSdk.KeystoreProvider,
				private readonly _accountDataRetriever: KinCommonSdk.AccountDataRetriever, 
				server: KinCommonSdk.Server, 
				environment: KinCommonSdk.Environment,
		        private readonly _appId: string = config.ANON_APP_ID) {
		if (!config.APP_ID_REGEX.test(_appId)) {
			throw new Error("Invalid app id: " + _appId);
		}
		this._txSender = new KinCommonSdk.TxSender(_publicAddress, keyStoreProvider, _appId, server, environment);
	}

	get publicAddress(): Address {
		return this._publicAddress;
	}

	get appId(): string {
		return this._appId;
	}

	async getBalance(): Promise<Balance> {
		return await this._accountDataRetriever.fetchKinBalance(this._publicAddress);
	}

	async getData(): Promise<AccountData> {
		return await this._accountDataRetriever.fetchAccountData(this._publicAddress);
	}

	public async sendPaymentTransaction(transactionParams: PaymentTransactionParams, 
		interceptor?: TransactionInterceptor): Promise<KinCommonSdk.TransactionId> {
		return await this._txSender.sendPaymentTransaction(transactionParams, interceptor);
	}

	/**
	 * Check if the account exists on kin blockchain.
	 */
	public async isAccountExisting(): Promise<Boolean> {
		return await this._accountDataRetriever.isAccountExisting(this._publicAddress);
	}
}
