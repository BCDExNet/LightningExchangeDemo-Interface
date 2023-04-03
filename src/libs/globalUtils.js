import BigNumber from "bignumber.js";

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
		REVERTED_MESSAGE: "Transaction has been reverted by the EVM"
	},
	messageType: {
		ERROR: 0,
		INFO: 1,
		DONE: 2
	}
};