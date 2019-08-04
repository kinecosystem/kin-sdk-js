import { Transaction } from "@kinecosystem/kin-sdk";

export default interface KeystoreProvider {
	accounts: Promise<string[]>;
	signTransaction(
		accountAddress: string,
		xdrTransaction: Transaction
	): Promise<Transaction>;
}
