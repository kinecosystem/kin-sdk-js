import * as KinSdk from "..";

declare global {
	interface Window {
		KinSdk: typeof KinSdk;
	}
}
window.KinSdk = KinSdk;
