import { Transaction } from "@kinecosystem/kin-sdk";
import { Address } from "..";

export default interface KeystoreProvider {
	accounts: Promise<Address[]>;
	signTransaction(accountAddress: Address, xdrTransaction: string): Promise<string>;
}
