import {Server, Address, Balance, AccountData, PaymentTransactionParams, TransactionInterceptor, PaymentTransaction, EventListener, MultiPaymentsListener } from "@kinecosystem/kin-sdk-js-common";
        
export interface EventRegistration {
    remove(): void;
}

export class PaymentEventRegistration implements EventRegistration { 
    private _multipaymentListener: MultiPaymentsListener;
    constructor(private readonly server: Server, private readonly listener: EventListener<PaymentTransaction>, publicAddress:Address){
        this._multipaymentListener = new MultiPaymentsListener(server, listener, [publicAddress])
    }

    remove(): void {
        this._multipaymentListener.close()
    }
}
 