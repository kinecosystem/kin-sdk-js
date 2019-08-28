import { Address, TransactionId } from "../types";
import { Asset, Operation, Server, Transaction, xdr, Network } from "@kinecosystem/kin-sdk";
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

	public async getWhitelistableTransaction(transactionString: string): Promise<TransactionId>{
		try {
			const signedTransactionString = await this._keystoreProvider.sign(this._publicAddress, transactionString);
			const signedTransaction = new Transaction(signedTransactionString);
			return signedTransaction.toEnvelope().toXDR().toString('base64');
		} catch (e) {
			const error = ErrorDecoder.translate(e);
			throw error;
		}
	}

	public async submitTransaction(transactionString: string): Promise<TransactionId> {
		try {
			const signedTransactionString = await this._keystoreProvider.sign(this._publicAddress, transactionString);
			const signedTransaction = new Transaction(signedTransactionString);
			const transactionResponse = await this._server.submitTransaction(signedTransaction);
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
