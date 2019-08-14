import { Address } from "../types";

export default interface KeystoreProvider {
	accounts: Promise<Address[]>;
	sing(accountAddress: Address, xdrTransaction: string): Promise<string>;
}
