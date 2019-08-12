import { Address } from "../types";

export default interface KeystoreProvider {
	accounts: Promise<Address[]>;
	signTransaction(accountAddress: Address, xdrTransaction: string): Promise<string>;
}
