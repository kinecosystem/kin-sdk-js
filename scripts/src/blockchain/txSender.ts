import { Address, TransactionId } from "..";
import { Asset, Operation, Server } from "@kinecosystem/kin-sdk";
import { Transaction, xdr } from "@kinecosystem/kin-base";
import { TransactionBuilder } from "./transactionBuilder";
import { ErrorDecoder } from "../errors";
import { IBlockchainInfoRetriever } from "./blockchainInfoRetriever";
import KeystoreProvider from "./keystoreProvider";

export class TxSender {
	constructor(
		private readonly _publicAddress: Address,
		private readonly _keystoreProvider: KeystoreProvider,
		private readonly _appId: string,
		private readonly _server: Server,
		private readonly _blockchainInfoRetriever: IBlockchainInfoRetriever
	) {

		this._keystoreProvider = _keystoreProvider;
		this._appId = _appId;
		this._server = _server;
		this._blockchainInfoRetriever = _blockchainInfoRetriever;
	}

	get appId() {
		return this._appId;
	}

	public async getTransactionBuilder(txFee: number): Promise<TransactionBuilder> {
		const response = await this.loadSenderAccountData();
		return new TransactionBuilder(
			response,
			{ fee: txFee, appId: this.appId },

		).setTimeout(0);
	}

	public async buildCreateAccount(address: Address, startingBalance: number, fee: number, memo?: string): Promise<TransactionBuilder> {
		const builder = await this.getTransactionBuilder(fee);
		if (memo) {
			builder.addTextMemo(memo);
		}
		builder.addOperation(
			Operation.createAccount({
				source: this._publicAddress,
				destination: address,
				startingBalance: startingBalance.toString(),
			})
		);
		return builder;
	}

	public async buildTransaction(address: Address, amount: number, fee: number, memo?: string): Promise<TransactionBuilder> {
		const builder = await this.getTransactionBuilder(fee);
		if (memo) {
			builder.addTextMemo(memo);
		}
		builder.addOperation(
			Operation.payment({
				source: this._publicAddress,
				destination: address,
				asset: Asset.native(),
				amount: amount.toString(),
			})
		);
		return builder;
	}

	public async sendWhitelistableTransaction(transaction: string): Promise<TransactionId> {
		try {
			const transactionEnvelope = xdr.TransactionEnvelope.fromXDR(new Buffer(transaction, "base64"));
			const xdrTransaction = new Transaction(transactionEnvelope);
			const signedXdrTransaction = await this._keystoreProvider.signTransaction(
				this._publicAddress,
				xdrTransaction
			);
			const transactionResponse = await this._server.submitTransaction(
				signedXdrTransaction
			);
			return transactionResponse.hash;
		} catch (e) {
			const error = ErrorDecoder.translate(e);
			throw error;
		}
	}

	public async submitTransaction(transaction: TransactionBuilder | Transaction): Promise<TransactionId> {
		try {
			let xdrTransaction;
			if (transaction instanceof TransactionBuilder) {
				xdrTransaction = transaction.build();
			} else if (transaction instanceof Transaction) {
				xdrTransaction = transaction;
			} else {
				throw new Error("submitTransaction type mismatch");
			}
			const signedXdrTransaction = await this._keystoreProvider.signTransaction(
				this._publicAddress,
				xdrTransaction
			);
			const transactionResponse = await this._server.submitTransaction(
				signedXdrTransaction
			);
			return transactionResponse.hash;
		} catch (e) {
			const error = ErrorDecoder.translate(e);
			throw error;
		}
	}

	private async loadSenderAccountData() {
		const response: Server.AccountResponse = await this._server.loadAccount(
			this._publicAddress
		);
		return response;
	}
}
