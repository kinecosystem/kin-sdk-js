const PACKAGE_JSON = require("../../package.json").version;
export const GLOBAL_HEADERS = new Map<string, string>()
	.set("kin-sdk-js-web-version", PACKAGE_JSON);


