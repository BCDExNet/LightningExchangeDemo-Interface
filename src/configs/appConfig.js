export const appConfig = {
	updateDurationMS: 600000,
	priceApi: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false&page=1&ids=bitcoin,usd-coin",
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
	exchanges: {
		"20": {
			b2cTaker: "0xf495e080adcc153579423a3860801a4e282b26f2",
			"USDC": {
				address: "0xA06be0F5950781cE28D965E5EFc6996e88a8C141",
				abi: "/abis/erc20.json"
			},
			safeBox: {
				address: "0xdEF092bC601cEcccAd596268b841B42306273970",
				abi: "/abis/safe_box.json"
			}
		},
		"56": {
			b2cTaker: "0xf495e080adcc153579423a3860801a4e282b26f2",
			"USDC": {
				address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
				abi: "/abis/erc20.json"
			},
			safeBox: {
				address: "0xd1a9559D4D54Ae11ad5ceBa1b309484502f4575d",
				abi: "/abis/safe_box.json"
			}
		}
	}
};