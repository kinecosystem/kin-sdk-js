import {Address, TransactionId, WhitelistPayload} from "../types";
import {Asset, Keypair, Network, Operation, Server} from "@kinecosystem/kin-sdk";
import {KeyPair} from "./keyPair";
import {TransactionBuilder} from "./transactionBuilder";
import {ErrorDecoder, HorizonError, NetworkError, NetworkMismatchedError} from "../errors";
import {IBlockchainInfoRetriever} from "./blockchainInfoRetriever";
import {CHANNEL_TOP_UP_TX_COUNT} from "../config";
import {TransactionErrorList} from "./errors";
import KeystoreProvider from "../keystoreProviders/keystoreProviderInterface";
import { Transaction as TransactionInterface, Channel } from "..";
import { Transaction } from "@kinecosystem/kin-sdk";
import { DecodeTransactionParams } from "./horizonModels";

interface WhitelistPayloadTemp {
	// The android stellar sdk spells 'envelope' as 'envelop'
	envelop: string;
	envelope?: string;
	networkId: string;
}

export class TxSender {
	constructor(private readonly _publicAddress:Address, private readonly _keystoreProvider: KeystoreProvider,
				         private readonly _appId: string,
				         private readonly _server: Server,
				         private readonly _blockchainInfoRetriever: IBlockchainInfoRetriever) {
		this._keystoreProvider = _keystoreProvider;
		this._appId = _appId;
		this._server = _server;
		this._blockchainInfoRetriever = _blockchainInfoRetriever;
	}

	get appId() {
		return this._appId;
	}

	public async getTransactionBuilder(txFee: number, channel?: Channel): Promise<TransactionBuilder> {
		const response = await this.loadSenderAccountData(channel);
		return new TransactionBuilder(response, { fee: txFee, appId: this.appId }, channel)
			.setTimeout(0);
	}

	public async buildCreateAccount(address: Address, startingBalance: number, fee: number, memo?: string, channel?: Channel): Promise<TransactionBuilder> {
		const builder = await this.getTransactionBuilder(fee, channel);
		if (memo) {
			builder.addTextMemo(memo);
		}
		builder.addOperation(Operation.createAccount({
			source: this._publicAddress,
			destination: address,
			startingBalance: startingBalance.toString()
		}));
		return builder;
	}

	public async buildSendKin(address: Address, amount: number, fee: number, memo?: string, channel?: Channel): Promise<TransactionBuilder> {
		const builder = await this.getTransactionBuilder(fee, channel);
		if (memo) {
			builder.addTextMemo(memo);
		}
		builder.addOperation(Operation.payment({
			source: this._publicAddress,
			destination: address,
			asset: Asset.native(),
			amount: amount.toString()
		}));
		return builder;
	}

	public async submitTransaction(builder: TransactionBuilder): Promise<TransactionId> {
		try {
			const xdrTransaction = builder.build();
			console.log("submitTransaction::submitTransaction::xdrTransaction");
			console.log(xdrTransaction);
			const signedXdrTransaction = await this._keystoreProvider.signTransaction(this._publicAddress, xdrTransaction);
			/**
			 * This code is needs to be implemented by the keystoreProvider
			 */
			// const signers = new Array<Keypair>();
			// signers.push(Keypair.fromSecret(this._keypair.seed));
			// if (builder.channel) {
			// 	signers.push(Keypair.fromSecret(builder.channel.keyPair.seed));
			// }
			// tx.sign(...signers);
			const transactionResponse = await this._server.submitTransaction(signedXdrTransaction);
			return transactionResponse.hash;
		} catch (e) {
			const error = ErrorDecoder.translate(e);
			if (this.checkForInsufficientChannelFeeBalance(builder, error)) {
				await this.topUpChannel(builder);
				// Insufficient balance is a "fast-fail", the sequence number doesn't increment
				// so there is no need to build the transaction again
				return this.submitTransaction(builder);
			} else {
				throw error;
			}
		}
	}

	// public whitelistTransaction(payload: string | WhitelistPayload): string {
	// 	let txPair: WhitelistPayload | WhitelistPayloadTemp;
	// 	if (typeof payload === "string") {
	// 		const tx = JSON.parse(payload);
	// 		if (tx.envelop != null) {
	// 			txPair = tx as WhitelistPayloadTemp;
	// 			txPair.envelope = txPair.envelop;
	// 		} else {
	// 			txPair = tx as WhitelistPayload;
	// 		}
	// 	} else {
	// 		txPair = payload;
	// 	}

	// 	if (typeof txPair.envelope !== "string") {
	// 		throw new TypeError("'envelope' must be type of string");
	// 	}

	// 	const networkPassphrase = Network.current().networkPassphrase();
	// 	if (networkPassphrase !== txPair.networkId) {
	// 		throw new NetworkMismatchedError("Unable to sign whitelist transaction, network type is mismatched");
	// 	}

	// 	const transaction = new XdrTransaction(txPair.envelope);
	// 	transaction.sign(Keypair.fromSecret(this._keypair.seed));
	// 	const envelope = transaction.toEnvelope();
	// 	const buffer = envelope.toXDR("base64");

	// 	return buffer.toString();
	// }

	private checkForInsufficientChannelFeeBalance(builder: TransactionBuilder, error: HorizonError | NetworkError): boolean {
		if (!builder.channel) {
			return false;
		}
		return (error as HorizonError).resultTransactionCode === TransactionErrorList.INSUFFICIENT_BALANCE;
	}

	private async topUpChannel(builder: TransactionBuilder) {
		// const channel = builder.channel as Channel;
		// const fee = await this._blockchainInfoRetriever.getMinimumFee();
		// const amount = fee * CHANNEL_TOP_UP_TX_COUNT;
		// const topUpBuilder = await this.buildSendKin(channel.keyPair.publicAddress, amount, fee);
		// await this.submitTransaction(topUpBuilder);
	}

	private async loadSenderAccountData(channel?: Channel) {
		const addressToLoad = channel ? channel.keyPair.publicAddress : await this._publicAddress;
		const response: Server.AccountResponse = await this._server.loadAccount(addressToLoad);
		return response;
	}
}
