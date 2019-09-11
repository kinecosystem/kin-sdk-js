import { PaymentTransactionParams, TransactionFactory } from "../blockchain/transactionFactory"
import { Server, Operation, Asset} from "@kinecosystem/kin-sdk";
import { TransactionBuilder } from "./transactionBuilder";
import { TransactionInterceptor, TransactionProcess } from "./transactionInterceptor"
import { ErrorDecoder, InterceptionError } from "../errors";
import { KeystoreProvider } from "./keystoreProvider";
import { Address, Channel, Transaction, TransactionId } from "../blockchain/horizonModels"
import { XdrTransaction, Environment, TransactionParams } from "..";

export class TxSender {
	constructor(
		private readonly _publicAddress: Address,
		private readonly _keystoreProvider: KeystoreProvider,
		private readonly _server: Server,
		private readonly _environment: Environment,
		private readonly _appId?: string
	) {
		this._keystoreProvider = _keystoreProvider;
		this._appId = _appId;
		this._server = _server;
		this._environment = _environment
	}

	get appId() {
		return this._appId;
	}

	static TransactionProcessImpl = class implements TransactionProcess {
		constructor(readonly _transaction: Transaction, readonly _server:Server) {
		}

		transaction(): Transaction {
			return this._transaction
		}		
		
		async sendTransaction(transaction: Transaction): Promise<TransactionId> {
			const record = await this._server.submitTransaction(new XdrTransaction(transaction.envelope))
			return record.hash;
		}

		async sendWhitelistTransaction(transactionEnvelope: string): Promise<TransactionId> {
			const record = await this._server.submitTransaction(new XdrTransaction(transactionEnvelope))
			return record.hash;
		}
	}

	public async sendTransaction(transactionParams: TransactionParams, interceptor?: TransactionInterceptor): Promise<TransactionId>{
		let xdrTransactionEnvelope: string = ""
		if ( (transactionParams as PaymentTransactionParams).address ){
			xdrTransactionEnvelope = await this.buildPaymentTransactionEnvelope(transactionParams as PaymentTransactionParams);			
		}
		const signedEnvelope = await this.addSignatures(transactionParams, xdrTransactionEnvelope);
		return this.sendTransactionInternal(signedEnvelope, interceptor);
	}

	private async addSignatures(transactionParams: TransactionParams, xdrTransactionEnvelope: string): Promise<string> {
		let signers: string[] = [];
		signers.push(this._publicAddress);
		if (transactionParams.channel) {
			signers.push(transactionParams.channel.publicAddress);
		}
		const signedEnvelope = await this._keystoreProvider.sign(xdrTransactionEnvelope, ...signers);
		return signedEnvelope;
	}

	private async sendTransactionInternal(signedEnvelope: string, interceptor: TransactionInterceptor|undefined): Promise<TransactionId> {
		try {
			let transactionId: TransactionId;
			if (interceptor){
				const paymentTransaction = TransactionFactory.fromTransactionPayload(signedEnvelope, this._environment._passphrase);
				try {
					transactionId = await interceptor.interceptTransactionSending(new TxSender.TransactionProcessImpl(paymentTransaction, this._server));
				}
				catch (e) {
					throw new InterceptionError(e);
				}
			}
			else {
				const transactionResponse = await this._server.submitTransaction(new XdrTransaction(signedEnvelope));
				transactionId = transactionResponse.hash;
			}
			return transactionId;
		} catch (e) {
			const error = ErrorDecoder.translate(e);
			throw error;
		}
	}

	private async buildPaymentTransactionEnvelope(transactionParams: PaymentTransactionParams) {
		const builder = await this.getTransactionBuilder(transactionParams.fee, transactionParams.channel);
		if (transactionParams.memoText) {
			builder.addTextMemo(transactionParams.memoText);
		}
		builder.addOperation(Operation.payment({
			source: this._publicAddress,
			destination: transactionParams.address,
			asset: Asset.native(),
			amount: transactionParams.amount.toString(),
		}));
		return builder.build().toEnvelope().toXDR("base64").toString();
	}

	private async getTransactionBuilder(txFee: number, txChannel?: Channel): Promise<TransactionBuilder> {
		const response = await this.loadSenderAccountData(txChannel);
		return new TransactionBuilder(
			response,
			{ fee: txFee, appId: this.appId, channel: txChannel, keyStoreProvider: this._keystoreProvider}, 
		).setTimeout(0);
	}

	private async loadSenderAccountData(channel?: Channel) {
		const addressToLoad = channel ? channel.publicAddress : this._publicAddress;
		const response: Server.AccountResponse = await this._server.loadAccount(
			addressToLoad
		);
		return response;
	}
}
