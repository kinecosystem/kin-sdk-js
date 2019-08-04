import { Transaction } from "@kinecosystem/kin-sdk";

export default interface KeystoreProvider {
	publicAddress: Promise<string>;
	signTransaction(xdrTransaction: Transaction): Promise<Transaction>;
}
