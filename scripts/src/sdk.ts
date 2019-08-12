import {
	KinClient,
	Environment,
	XdrTransaction,
	BaseKeyPair,
	KeyPair } from ".";

import KeystoreProvider from "./blockchain/keystoreProvider";

const kinSdk = {
	KinClient,
	Environment,
	XdrTransaction,
	KeyPair,
	BaseKeyPair
};

declare global {
	interface Window {
		KinSdk: typeof kinSdk;
		KeystoreProvider?: KeystoreProvider;
	}
}

window.KinSdk = kinSdk;
