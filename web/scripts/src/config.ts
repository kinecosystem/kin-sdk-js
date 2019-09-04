const PACKAGE_JSON = require("../../package.json").version;
export const GLOBAL_HEADERS = new Map<string, string>()
	.set("kin-sdk-js-web-version", PACKAGE_JSON);
export const ANON_APP_ID: string = "anon";
export const GLOBAL_RETRY =  { retries: 4 };
export const APP_ID_REGEX: RegExp = new RegExp("^[a-zA-Z0-9]{3,4}$");
