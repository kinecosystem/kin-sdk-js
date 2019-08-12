import { KinClient,
	Environment,
	XdrTransaction,
	BaseKeyPair,
	KeyPair } from ".";

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
	}
}
window.KinSdk = kinSdk;
