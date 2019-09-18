import {Server, Transaction as XdrTransaction, Network, xdr} from "@kinecosystem/kin-sdk";
import {
	CreateAccountTransaction,
	PaymentTransaction,
	RawTransaction,
	Transaction,
    TransactionBase,
    Address,
    Channel
} from "./horizonModels";
import {NetworkMismatchedError} from "../errors"

export interface TransactionParams {
	/**
	 * Fee to be deducted for the transaction.
	 */
	fee: number;
	/**
	 * Optional text to put into transaction memo, up to 21 chars.
	 */
	memoText?: string;
	/**
	 * Optional channel to build the transaction with
	 */
	channel?: Channel;
}

export interface PaymentTransactionParams extends TransactionParams {
	/**
	 * Target account address to create.
	 */
	address: Address;
	/**
	 * The amount in kin to send.
	 */
	amount: number;
}

export interface CreateAccountParams extends TransactionParams {	
    /**
    * Target account address to create.
    */
    address: Address;
    /**
    * The starting balance of the created account.
    */
    startingBalance: number;
}

export class TransactionFactory { 

    public static fromStellarTransaction(transactionRecord: Server.TransactionRecord, simplified?: boolean): Transaction {
        const xdrTransaction = new XdrTransaction(transactionRecord.envelope_xdr);
        const operations = xdrTransaction.operations;
        const transactionBase: TransactionBase = {
            fee: xdrTransaction.fee,
            hash: transactionRecord.hash,
            sequence: parseInt(transactionRecord.source_account_sequence),
            signatures: xdrTransaction.signatures,
            source: transactionRecord.source_account,
            timestamp: transactionRecord.created_at,
            envelope: transactionRecord.envelope_xdr,
            type: "RawTransaction"
        };

        if (simplified !== false) {
            if (operations.length === 1) {
                const operation = operations[0];
                if (operation.type === "payment") {
                    return <PaymentTransaction> {
                        ...transactionBase,
                        source: operation.source ? operation.source : transactionRecord.source_account,
                        destination: operation.destination,
                        amount: parseFloat(operation.amount),
                        memo: transactionRecord.memo,
                        type: "PaymentTransaction"
                    };
                } else if (operation.type === "createAccount") {
                    return <CreateAccountTransaction> {
                        ...transactionBase,
                        source: operation.source ? operation.source : transactionRecord.source_account,
                        destination: operation.destination,
                        startingBalance: parseFloat(operation.startingBalance),
                        memo: transactionRecord.memo,
                        type: "CreateAccountTransaction"
                    };
                }
            }
        }

        return <RawTransaction> {
            ...transactionBase,
            memo: xdrTransaction.memo,
            operations: xdrTransaction.operations
        };
    }

    public static fromTransactionPayload(envelope: string, networkId: string, simplified?: boolean): Transaction {
        const xdrTransaction = new XdrTransaction(envelope);
        const transactionBase: TransactionBase = {
            fee: xdrTransaction.fee,
            hash: xdrTransaction.hash().toString("base64"),
            sequence: parseInt(String(xdrTransaction.sequence)),
            signatures: xdrTransaction.signatures,
            source: xdrTransaction.source,
            timestamp: undefined,
            envelope: envelope,
            type: "RawTransaction"
        };

        const networkPassphrase = Network.current().networkPassphrase();
        if (networkPassphrase !== networkId) {
            throw new NetworkMismatchedError(`Unable to decode transaction, network type is mismatched`);
        }

        if (simplified !== false) {
            if (xdrTransaction.operations.length === 1) {
                const operation = xdrTransaction.operations[0];
                if (operation.type === "payment") {
                    return <PaymentTransaction> {
                        ...transactionBase,
                        source: operation.source ? operation.source : xdrTransaction.source,
                        destination: operation.destination,
                        amount: parseFloat(operation.amount),
                        memo: xdrTransaction.memo.value,
                        type: "PaymentTransaction"
                    };
                } else if (operation.type === "createAccount") {
                    return <CreateAccountTransaction> {
                        ...transactionBase,
                        source: operation.source ? operation.source : xdrTransaction.source,
                        destination: operation.destination,
                        startingBalance: parseFloat(operation.startingBalance),
                        memo: xdrTransaction.memo.value,
                        type: "CreateAccountTransaction"
                    };
                }
            }
        }
        return <RawTransaction> {
                ...transactionBase,
            memo: xdrTransaction.memo,
            operations: xdrTransaction.operations
        };
    }
}