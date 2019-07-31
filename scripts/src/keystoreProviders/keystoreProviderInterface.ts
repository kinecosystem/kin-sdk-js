import {Address} from "../types";
import {Transaction as XdrTransaction} from "@kinecosystem/kin-sdk";

export default interface KeystoreProvider {
    publicAddress: Address;
    signTransaction(transactionEnvelope: string): string;
}