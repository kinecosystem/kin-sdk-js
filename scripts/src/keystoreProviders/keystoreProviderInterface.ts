import {Address} from "../types";
import {Transaction as XdrTransaction} from "@kinecosystem/kin-sdk";

export default interface KeystoreProvider {
    publicAddress: Promise<Address>;
    signTransaction(xdrTransaction: XdrTransaction ): Promise<XdrTransaction>;
}