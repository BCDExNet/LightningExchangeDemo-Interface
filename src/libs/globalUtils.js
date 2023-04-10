import BigNumber from "bignumber.js";
import { appConfig } from "../configs/appConfig";

export const globalUtils = {
	constants: {
		WALLET_SWITCH_ETHEREUM_CHAIN: "wallet_switchEthereumChain",
		WALLET_ADD_ETHEREUM_CHAIN: "wallet_addEthereumChain",
		BIGNUMBER_ZERO: BigNumber(0),
		PRICE_DATA_STORED: "priceDataStored",
		PRICE_DATA_UPDATED: "priceDataUpdated",
		HEX_PREFIX: "0x",
		SAT_RATE: 1000,
		SOMETHING_WRONG: "Something Went Wrong!",
		AUTOCONNECT: "autoconnect",
		REVERTED_MESSAGE: "Transaction has been reverted by the EVM",
		MAX_BIGNUMBER_STRING: BigNumber(2).pow(256).minus(1).toFixed()
	},
	messageType: {
		ERROR: 0,
		INFO: 1,
		DONE: 2
	},
	timeDiff: end => {
		const now = new Date().getTime() / 1000;

		let diff = end - now;
		if (diff <= 0) {
			return 0;
		}

		let days = Math.trunc(diff / 86400);
		let hours = Math.trunc((diff - (86400 * days)) / 3600);
		let minutes = Math.trunc((diff - (days * 86400 + hours * 3600)) / 60);
		let seconds = Math.trunc(diff - (days * 86400 + hours * 3600 + minutes * 60));

		let diffString = '';

		if (days) {
			diffString += `${days}d`;
		}

		if (hours) {
			diffString += ` ${hours}h`;
		}

		if (minutes) {
			diffString += ` ${minutes}m`;
		}

		if (seconds) {
			diffString += ` ${seconds}s`;
		}

		return diffString;
	},
	formatBigNumber: (num, fraction = appConfig.fraction) => {
		if (isNaN(num) || !num) {
			console.warn(num);
			return "0";
		}

		const n = (typeof num) === "number" ? num : num.toNumber();
		return n.toLocaleString("en-US", { maximumFractionDigits: fraction })
	}
};