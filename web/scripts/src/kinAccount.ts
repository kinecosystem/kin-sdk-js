import * as KinCommonSdk from "@kinecosystem/kin-sdk-js-common";
import {Address, Balance, AccountData, PaymentTransactionParams, TransactionInterceptor, CreateAccountTransaction, PaymentTransaction, EventListener, MultiPaymentsListener } from "@kinecosystem/kin-sdk-js-common";
import {ListenerRegistration, PaymentListenerRegistration, CreateAcccountRegistration} from "./listenerRegistration"

export class KinAccount {
	private readonly _txSender: KinCommonSdk.TxSender;

	constructor(private readonly _publicAddress: KinCommonSdk.Address, 
				keyStoreProvider: KinCommonSdk.KeystoreProvider,
				private readonly _accountDataRetriever: KinCommonSdk.AccountDataRetriever, 
				private readonly _server: KinCommonSdk.Server, 
				environment: KinCommonSdk.Environment,
		        private readonly _appId?: string) {
		this._txSender = new KinCommonSdk.TxSender(_publicAddress, keyStoreProvider, _server, environment, _appId);
	}

	get publicAddress(): Address {
		return this._publicAddress;
	}

	get appId(): string | undefined {
		return this._appId;
	}

	async getBalance(): Promise<Balance> {
		return await this._accountDataRetriever.fetchKinBalance(this._publicAddress);
	}

	async getData(): Promise<AccountData> {
		return await this._accountDataRetriever.fetchAccountData(this._publicAddress);
	}

	async sendPaymentTransaction(transactionParams: PaymentTransactionParams, 
		interceptor?: TransactionInterceptor): Promise<KinCommonSdk.TransactionId> {
		return await this._txSender.sendTransaction(transactionParams, interceptor);
	}

	/**
	 * Check if the account exists on kin blockchain.
	 */
	async isAccountExisting(): Promise<Boolean> {
		return await this._accountDataRetriever.isAccountExisting(this._publicAddress);
	}

	addPaymentListener(listener: EventListener<PaymentTransaction>): ListenerRegistration {
		return new PaymentListenerRegistration(this._server, listener, this._publicAddress);
	} 

	addAccountCreatedListener(listener: EventListener<void>): ListenerRegistration {
		return new CreateAcccountRegistration(this._server, listener, this._publicAddress);
	}

}
