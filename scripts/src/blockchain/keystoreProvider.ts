import { Address } from "../types";

export default interface KeystoreProvider {
	accounts: Promise<Address[]>;
	sign(accountAddress: Address, xdrTransaction: string): Promise<string>;
}
