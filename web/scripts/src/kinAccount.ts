import {
	Address,
	Balance,
	AccountData,
	PaymentTransactionParams,
	TransactionInterceptor,
	PaymentTransaction,
	EventListener,
	TransactionId,
	TxSender,
	KeystoreProvider,
	AccountDataRetriever,
	Server,
	Environment
} from "@kinecosystem/kin-sdk-js-common";
import { ListenerRegistration, PaymentListenerRegistration, CreateAcccountRegistration } from "./listenerRegistration";

export class KinAccount {
	private readonly _txSender: TxSender;

	constructor(
		private readonly _publicAddress: Address,
		keyStoreProvider: KeystoreProvider,
		private readonly _accountDataRetriever: AccountDataRetriever,
		private readonly _server: Server,
		environment: Environment,
		private readonly _appId?: string
	) {
		this._txSender = new TxSender(_publicAddress, keyStoreProvider, _server, environment, _appId);
	}

	get publicAddress(): Address {
		return this._publicAddress;
	}

	get appId(): string | undefined {
		return this._appId;
	}

	public async getBalance(): Promise<Balance> {
		return await this._accountDataRetriever.fetchKinBalance(this._publicAddress);
	}

	public async getData(): Promise<AccountData> {
		return await this._accountDataRetriever.fetchAccountData(this._publicAddress);
	}

	public async sendPaymentTransaction(transactionParams: PaymentTransactionParams, interceptor?: TransactionInterceptor): Promise<TransactionId> {
		return await this._txSender.sendTransaction(transactionParams, interceptor);
	}

	/**
   * Check if the account exists on kin blockchain.
   */
	public async isAccountExisting(): Promise<Boolean> {
		return await this._accountDataRetriever.isAccountExisting(this._publicAddress);
	}

	public addPaymentListener(listener: EventListener<PaymentTransaction>): ListenerRegistration {
		return new PaymentListenerRegistration(this._server, listener, this._publicAddress);
	}

	public addAccountCreatedListener(listener: EventListener<void>): ListenerRegistration {
		return new CreateAcccountRegistration(this._server, listener, this._publicAddress);
	}
}
