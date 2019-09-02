import {Address} from "../types";

export interface KeystoreProvider {
	accounts: Promise<Address[]>;
	sign(accountAddress: Address, xdrTransaction: string): Promise<string>;
}
