import {Server, Transaction as XdrTransaction, Network} from "@kinecosystem/kin-sdk";
import {
	CreateAccountTransaction,
	PaymentTransaction,
	RawTransaction,
	Transaction,
	TransactionBase,
} from "./horizonModels";
import {NetworkMismatchedError} from "../errors"

export class TransactionConverter { 
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
        const transactionRecord = new XdrTransaction(envelope);
        const transactionBase: TransactionBase = {
            fee: transactionRecord.fee,
            hash: transactionRecord.hash().toString("base64"),
            sequence: parseInt(String(transactionRecord.sequence)),
            signatures: transactionRecord.signatures,
            source: transactionRecord.source,
            timestamp: undefined,
            type: "RawTransaction"
        };

        const networkPassphrase = Network.current().networkPassphrase();
        if (networkPassphrase !== networkId) {
            throw new NetworkMismatchedError(`Unable to decode transaction, network type is mismatched`);
        }

        if (simplified !== false) {
            if (transactionRecord.operations.length === 1) {
                const operation = transactionRecord.operations[0];
                if (operation.type === "payment") {
                    return <PaymentTransaction> {
                        ...transactionBase,
                        source: operation.source ? operation.source : transactionRecord.source,
                        destination: operation.destination,
                        amount: parseFloat(operation.amount),
                        memo: transactionRecord.memo.value,
                        type: "PaymentTransaction"
                    };
                } else if (operation.type === "createAccount") {
                    return <CreateAccountTransaction> {
                        ...transactionBase,
                        source: operation.source ? operation.source : transactionRecord.source,
                        destination: operation.destination,
                        startingBalance: parseFloat(operation.startingBalance),
                        memo: transactionRecord.memo.value,
                        type: "CreateAccountTransaction"
                    };
                }
            }
        }
        return <RawTransaction> {
                ...transactionBase,
            memo: transactionRecord.memo,
            operations: transactionRecord.operations
        };
    }
}