import {Server, Address, PaymentTransaction, EventListener, 
    MultiPaymentsListener, AccountCreationListener, CreateAccountTransaction } from "@kinecosystem/kin-sdk-js-common";
        
export interface ListenerRegistration {
    remove(): void;
}

export class PaymentListenerRegistration implements ListenerRegistration { 
    private _multipaymentListener: MultiPaymentsListener;
    constructor(private readonly server: Server, private readonly listener: EventListener<PaymentTransaction>, publicAddress:Address){
        this._multipaymentListener = new MultiPaymentsListener(server, listener, [publicAddress], false)
    }

    remove(): void {
        this._multipaymentListener.close()
    }
}

export class CreateAcccountRegistration implements ListenerRegistration {
    private _createAccountListener: AccountCreationListener;
    constructor(private readonly server: Server, private readonly listener: EventListener<void>, publicAddress:Address){
        this._createAccountListener = new AccountCreationListener(server, listener, publicAddress)
    }

    remove(): void {
        this._createAccountListener.close()
    }
}
 