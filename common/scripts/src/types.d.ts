export type Address = string;
export type TransactionId = string;
export interface WhitelistPayload {
	envelope: string;
	networkId: string;
}
export type ChannelState = 'busy' | 'free';
export interface Channel {
	readonly keyPair: KeyPair;
	state: ChannelState;
}
