import {Address} from "../types";
import {Transaction as XdrTransaction} from "@kinecosystem/kin-sdk";

export default interface KeystoreProvider {
    accounts: Promise<Array<Address>>;
    signTransaction(publicAddress: Address, xdrTransaction: XdrTransaction ): Promise<XdrTransaction>;
}