export const appConfig = {
	networks: {
		elastos: {
			chainName: "Elastos",
			chain: "ESC",
			chainId: 20,
			rpcUrls: [
				"https://api.elastos.io/esc"
			],
			nativeCurrency: {
				name: "ELA",
				symbol: "ELA",
				decimals: 18
			},
			blockExplorerUrls: [
				"https://eth.elastos.io/"
			],
			iconUrls: []
		},
		bsc: {
			chainName: "Binance",
			chain: "BSC",
			chainId: 56,
			rpcUrls: [
				"https://bsc-dataseed1.defibit.io/"
			],
			nativeCurrency: {
				name: "BINANCE",
				symbol: "BSC",
				decimals: 18
			},
			blockExplorerUrls: [
				"https://bscscan.com/"
			],
			iconUrls: []
		}
	},
	updateDurationMS: 600000
};