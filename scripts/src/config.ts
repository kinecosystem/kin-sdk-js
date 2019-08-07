const PACKAGE_JSON = require("../../package.json");

export const ANON_APP_ID: string = "anon";
export const ADDRESS_LENGTH: number = 56;
export const APP_ID_REGEX: RegExp = new RegExp("^[a-zA-Z0-9]{3,4}$");
export const MEMO_LENGTH_ERROR: string = "Memo must be up to 28 characters, including memo prefix.";
export const MEMO_LENGTH: number = 21;

export const GLOBAL_HEADERS = new Map<string, string>()
	.set("kin-sdk-web-version", PACKAGE_JSON.version);

export const GLOBAL_RETRY =  { retries: 4 };
