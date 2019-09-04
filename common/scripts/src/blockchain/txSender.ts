import { PaymentTransactionParams, TransactionFactory } from "../blockchain/transactionFactory"
import { TransactionId } from "../types";
import { Server, Operation, Asset, xdr } from "@kinecosystem/kin-sdk";
import { TransactionBuilder } from "./transactionBuilder";
import { TransactionInterceptor, TransactionProcess } from "./transactionInterceptor"
import { ErrorDecoder } from "../errors";
import { IBlockchainInfoRetriever } from "./blockchainInfoRetriever";
import { KeystoreProvider } from "./keystoreProvider";
import { Address, Channel, Transaction, PaymentTransaction } from "../blockchain/horizonModels"
import { XdrTransaction, Environment } from "..";

export class TxSender {
	constructor(
		private readonly _publicAddress: Address,
		private readonly _keystoreProvider: KeystoreProvider,
		private readonly _appId: string,
		private readonly _server: Server,
		private readonly _environment: Environment
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

		transaction(): import("./horizonModels").Transaction {
			return this._transaction
		}		
		
		async sendTransaction(transaction: import("./horizonModels").Transaction): Promise<TransactionId> {
			const record = await this._server.submitTransaction(transaction.xdrTransaction)
			return record.hash;
		}

		async sendTransactionEnvelope(transactionEnvelope: string): Promise<TransactionId> {
			const record = await this._server.submitTransaction(new XdrTransaction(transactionEnvelope))
			return record.hash;
		}
	}

	public async sendPaymentTransaction(transactionParams: PaymentTransactionParams, interceptor?: TransactionInterceptor): Promise<TransactionId> {
		try {
			
			let transactionId: TransactionId;
			const xdrTransactionEnvelope = await this.buildTransactionEnvelope(transactionParams);
			const signedEnvelope = await this._keystoreProvider.sign(xdrTransactionEnvelope, this._publicAddress);
			console.log("xdrEnvelope="+signedEnvelope)
			if (interceptor != null){
				const paymentTransaction = TransactionFactory.fromTransactionPayload(signedEnvelope, this._environment._passphrase);
				transactionId = await interceptor.interceptTransactionSending(new TxSender.TransactionProcessImpl(paymentTransaction, this._server));
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

	private async buildTransactionEnvelope(transactionParams: PaymentTransactionParams) {
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
		return builder.buildEnvelope();
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
