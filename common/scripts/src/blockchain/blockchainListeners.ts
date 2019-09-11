import {Server} from "@kinecosystem/kin-sdk";
import {EventListener, MultiAccountPaymentListener, PaymentTransaction, Address} from "./horizonModels";
import {Utils} from "../utils";
import {TransactionFactory} from "./transactionFactory"

export class MultiPaymentsListener implements MultiAccountPaymentListener {

	private readonly _addresses: Set<Address> = new Set<Address>();
	private readonly _streamClose: any;

	constructor(server: Server, private readonly _eventListener: EventListener<PaymentTransaction>, addresses: Address[]) {
		if (addresses) {
			for (const address of addresses) {
				Utils.verifyValidAddressParam(address);
				this._addresses.add(address);
			}
		}
		this._streamClose = server.transactions().cursor('now').stream({
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
		this._streamClose();
	}
}
