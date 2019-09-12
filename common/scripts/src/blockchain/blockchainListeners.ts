import {Server} from "@kinecosystem/kin-sdk";
import {EventListener, PaymentListener, PaymentTransaction, Address, CreateAccountTransaction} from "./horizonModels";
import {Utils} from "../utils";
import {TransactionFactory} from "./transactionFactory"

export class AccountCreationListener {
	private _streamCloseMethod: any;

	constructor(server: Server, private readonly _eventListener: EventListener<void>, private readonly _accountAddress: Address){
		this._streamCloseMethod = server.transactions().forAccount(_accountAddress).cursor('now').stream({
			onmessage: (txRecord: Server.TransactionRecord) => {
				let tx = TransactionFactory.fromStellarTransaction(txRecord);
				this._eventListener.onDataUpdated();
				this._streamCloseMethod()
				this._streamCloseMethod = null
			}
		});
	}

	close() {
		if (this._streamCloseMethod){
			this._streamCloseMethod();
		}
	}
}

export class MultiPaymentsListener implements PaymentListener {

	private readonly _addresses: Set<Address> = new Set<Address>();
	private readonly _streamCloseFunction: any;

	constructor(private readonly _server: Server, private readonly _eventListener: EventListener<PaymentTransaction>, 
		addresses: Address[], multiAccounts: Boolean = true) {
		if (addresses) {
			for (const address of addresses) {
				Utils.verifyValidAddressParam(address);
				this._addresses.add(address);
			}
		}
		let futureCursor = multiAccounts ? this.getFutureCursor(): this.getFutureCursorForAccount(addresses[0]);
		this._streamCloseFunction = futureCursor.stream({
			onmessage: (txRecord: Server.TransactionRecord) => {
				let payment = TransactionFactory.fromStellarTransaction(txRecord) as PaymentTransaction;
				if (payment.amount && payment.destination &&
					(this._addresses.has(payment.source) || this._addresses.has(payment.destination))) {
					_eventListener.onDataUpdated(payment);
				}
			}
		});
	}

	addAddress(address: Address) {
		Utils.verifyValidAddressParam(address);
		this._addresses.add(address);
	}

	removeAddress(address: Address) {
		Utils.verifyValidAddressParam(address);
		this._addresses.delete(address);
	}

	close() {
		this._streamCloseFunction();
	}

	private getFutureCursorForAccount(account: Address){
		return this.getFutureCursor().forAccount(account);
	}

	private getFutureCursor(){
		return this._server.transactions().cursor('now');
	}
}