import * as KinSdk from "..";
import * as KeystoreProviders from "../keystoreProviders";

declare global {
	interface Window {
		KinSdk: any;
	}
}

window.KinSdk = KinSdk;
window.KinSdk.keystoreProviders = KeystoreProviders;
