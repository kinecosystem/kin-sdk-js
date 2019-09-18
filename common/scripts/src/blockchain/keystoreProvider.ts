import {Address} from "./horizonModels";

export interface KeystoreProvider {
	publicAddresses: Promise<Address[]>;
	sign(transactionEnvelope: string, ...publicAddresses: Address[]): Promise<string>;
}
