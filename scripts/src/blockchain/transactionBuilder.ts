import {
	Account,
	Memo,
	MemoText,
	MemoType,
	Transaction,
	TransactionBuilder as BaseTransactionBuilder,
	xdr
} from "@kinecosystem/kin-sdk";
import { MEMO_LENGTH, MEMO_LENGTH_ERROR } from "../config";

interface TransactionBuilderOptions extends BaseTransactionBuilder.TransactionBuilderOptions {
	fee: number;
	appId: string;
	memo?: Memo<MemoType.Text>;
}

export class TransactionBuilder {

	private readonly _transactionBuilder: BaseTransactionBuilder;
	private readonly _appId?: string;

	constructor(sourceAccount: Account, options: TransactionBuilderOptions) {
		this._transactionBuilder = new BaseTransactionBuilder(sourceAccount, options);
		this._appId = options.appId;
		this.addFee(options.fee);
		this.addMemo(options.memo ? options.memo : Memo.text(""));
	}

	public addFee(fee: number): this {
		if (typeof fee === "number" && fee >= 0) {
			(this as any)._transactionBuilder.baseFee = fee;
		} else {
			throw new TypeError("Fee must be a positive number");
		}
		return this;
	}

	public setTimeout(timeout: number) {
		this._transactionBuilder.setTimeout(timeout);
		return this;
	}

	public addTextMemo(memo: string) {
		if (memo && typeof memo === "string" && memo.length > MEMO_LENGTH) {
			throw new Error(MEMO_LENGTH_ERROR);
		}
		this.addMemo(memo ? Memo.text(memo) : Memo.text(""));
	}

	public addMemo(memo: Memo): this {
		if (!memo) {
			throw new TypeError("Memo must be defined.");
		}
		if (typeof memo.value === "string" && memo.value.length > MEMO_LENGTH) {
			throw new Error(MEMO_LENGTH_ERROR);
		}
		if (memo.type === MemoText) {
			this._transactionBuilder.addMemo(Memo.text("1-" + this._appId + "-" + memo.value));
		} else {
			this._transactionBuilder.addMemo(memo);
		}

		return this;
	}

	public addOperation(operation: xdr.Operation): this {
		this._transactionBuilder.addOperation(operation);
		return this;
	}

	public build(): Transaction {
		return this._transactionBuilder.build();
	}

	public toString(): string {
		return this.build().toEnvelope().toXDR("base64").toString();
	}

	public toWhitelistableTransaction(): string {
		return this.build().toEnvelope().toXDR().toString("base64");
	}
}
