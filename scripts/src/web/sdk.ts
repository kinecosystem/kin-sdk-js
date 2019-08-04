import * as KinSdk from "..";
import SimpleKeystoreProvider from "../keystoreProviders/SimpleKeystoreProvider";

declare global {
	interface Window {
		KinSdk: any;
	}
}

window.KinSdk = KinSdk;
window.KinSdk.SimpleKeystoreProvider = SimpleKeystoreProvider;
