import {Address} from "../types";

export interface KeystoreProvider {
	accounts: Promise<Address[]>;
	sign(transactionEnvelope: string, ...accountAddresses: Address[]): Promise<string>;
}
