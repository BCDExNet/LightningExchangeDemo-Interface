import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { AmountInput } from "../components/AmountInput";
import { AmountLabel } from "../components/AmountLabel";
import { PriceControl } from "../components/PriceControl";
import { StringInput } from "../components/StringInput";
import { appConfig } from "../configs/appConfig";
import { appController } from "../libs/appController";
import { globalUtils } from "../libs/globalUtils";
import { invoiceDecoder } from "../libs/invoiceDecoder";
import "./MainView.css";
import { DepositModal } from "./DepositModal";
import { MessageModal } from "./MessageModal";

export const C2CView = ({ data = null }) => {
	const [tokenAmount, setTokenAmount] = useState(globalUtils.constants.BIGNUMBER_ZERO);
	const [taker, setTaker] = useState("");
	const [btcAmount, setBTCAmount] = useState(globalUtils.constants.BIGNUMBER_ZERO);
	const [satFromInvoice, setSatFromInvoice] = useState(0);
	const [expiry, setExpiry] = useState(0);
	const [secretHash, setSecretHash] = useState("");
	const [invoice, setInvoice] = useState("");
	const [price, setPrice] = useState(0);
	const [tokenToSellSelected, setTokenToSellSelected] = useState(0);
	const [showDepositModal, setShowDepositModal] = useState(false);
	const [error, setError] = useState(null);
	const tokens = data?.tokens;
	const theToken = tokens[tokenToSellSelected];

	useEffect(() => {
		if (data) {
			setPrice(appController.getBTCPrice(tokens[0].symbol));
			// setBTCAmount(appController.computeBTCWithToken(tokens[0].symbol, 1));
		}

		return () => {
			tokens.forEach(item => {
				item.value = null;
				item.deficit = false
			});
		}
	}, []);

	const handleChange = val => {
		setTokenAmount(BigNumber(val).shiftedBy(theToken.decimals));
		setBTCAmount(appController.computeBTCWithToken(theToken.symbol, val, price));
		// recomputeAmountToSell(tokenToSellSelected, btcAmount);
	};

	// const handleChangeBTC = val => {
	// 	const sat = appController.btc2sat(val);
	// 	setBTCAmount(sat);
	// 	setTokenAmount(appController.computeTokenWithBTC(sat, theToken.symbol, price));
	// 	// recomputeAmountToSell(tokenToSellSelected, sat);
	// }

	const handleChangeTaker = val => {
		setTaker(val);
	};

	const reset = () => {
		setBTCAmount(0);
		setSatFromInvoice(0);
		setTokenAmount(globalUtils.constants.BIGNUMBER_ZERO)
		setExpiry(0);
		setSecretHash("");
		// recomputeAmountToSell(tokenToSellSelected, 0);
	};

	const handleChangeInvoice = val => {
		if (!val || val.length === 0) {
			return reset();
		}

		try {
			const decoded = invoiceDecoder.decode(val);
			if (decoded.amount > 0) {
				const sats = decoded.amount / 1000;

				// recomputeAmountToSell(tokenToSellSelected, sats);
				setTokenAmount(appController.computeTokenWithBTC(sats, theToken.symbol));
				setBTCAmount(sats);
				setSatFromInvoice(sats);
				setExpiry(decoded.timeStamp + decoded.expiry + 3600);
				setSecretHash("0x" + decoded.paymentHash);
				setInvoice(val);
			} else {
				window.alert("Amount is 0.");
				reset();
			}
		} catch (error) {
			console.error(error);
			reset();
		}
	};

	const handleUpdatePrice = val => {
		setPrice(val);
	};

	const handleDeposit = () => {
		appController.deposit(
			theToken.symbol,
			tokenAmount.integerValue().toString(),
			taker,
			secretHash,
			expiry,
			invoice,
			() => {
				setShowDepositModal(true);
			},
			err => {
				setShowDepositModal(false);

				setError({
					title: globalUtils.constants.SOMETHING_WRONG,
					text: err.message.length < 100 ? err.message : globalUtils.constants.REVERTED_MESSAGE
				});
			},
			theToken.isNative
		);
	};

	const handleCloseDepositModal = () => {
		setShowDepositModal(false);
	};

	const handleCloseError = () => {
		setError(null);
	};

	const handleApprove = () => {
		appController.approve(
			theToken.symbol,
			() => {
				setTimeout(() => {
					if (tokenAmount.gt(0) && taker && invoice && !theToken.deficit && secretHash && expiry > 0) {
						handleDeposit();
					}
				}, 6000);
			}
		);
	};

	const updateTokenData = async index => {
		const theToken = tokens[index];
		const result = await appController.getDataWithToken(theToken.symbol, theToken.isNative);
		theToken.allowance = result.allowance;
		theToken.balance = result.balance;
	};

	const recomputeAmountToSell = (index, sats) => {
		const theToken = tokens[index];
		const howMuchToken = appController.computeTokenWithBTC(sats, theToken.symbol, price);
		theToken.value = howMuchToken.shiftedBy(-theToken.decimals).toFixed();
		theToken.deficit = howMuchToken.gt(theToken.balance);
		setTokenAmount(howMuchToken);
	};

	useEffect(() => {
		recomputeAmountToSell(tokenToSellSelected, BigNumber(btcAmount));
	}, [tokenToSellSelected, btcAmount, price]);

	const handleSelectToken = async idx => {
		await updateTokenData(idx);
		setTokenToSellSelected(idx);
		setPrice(appController.getBTCPrice(tokens[idx].symbol));
		setBTCAmount(appController.computeBTCWithToken(tokens[idx].symbol, 1));
		// recomputeAmountToSell(idx, btcAmount);
	};

	return <div className="subViewLayout">
		<StringInput
			title="Invoice"
			tooltip={<>Generate an invoice in a wallet that supports the lighting network, then scan it or paste it's ID.<br /><a href="https://youtu.be/5gQNeiWz304" target="_blank" rel="noreferrer">click for details</a></>}
			onChange={handleChangeInvoice}
			placeholder="lnbc1..."
			qr={true} />

		<div className="amountLabel">
			<div>
				<div>You'll get</div>
				<div className="subTitle">(invoice amount)</div>
			</div>

			<div className="btcValue">
				<img
					src="/images/btc.png"
					height="24px"
					alt="btc" />

				<div className="value">
					<div>{satFromInvoice.toFixed(0)}&nbsp;sat</div>
					<div className="subTitle">{data && appController.sat2btc(satFromInvoice).multipliedBy(appController.getBTCPrice("usdc")).toFixed(2)}&nbsp;USD</div>
				</div>
			</div>
		</div>

		<AmountInput
			title="deposit"
			tooltip="Choose what asset to deposit in exchange for the lighting invoice amount."
			tokens={tokens}
			onTokenSelected={handleSelectToken}
			onChange={handleChange}
			valueForced={tokenAmount.shiftedBy(-theToken.decimals).toNumber()} />

		<PriceControl
			title="Exchange Rate"
			tooltip="Customise the exchange rate, according to what you agreed with your exchange partner"
			defaultPrice={price}
			onChange={handleUpdatePrice} />

		{/* <AmountInput
			title="You Buy"
			tokens={[{
				symbol: "btc",
				// value: btcAmount.toFixed(0) + " SATs",
				balance: BigNumber(Number.MAX_SAFE_INTEGER).shiftedBy(12),
				decimals: 12,
				logo: "/images/btc.png"
			}]}
			valueForced={BigNumber(btcAmount)?.shiftedBy(-8).toFixed()}
			onChange={handleChangeBTC}
			showMax={false}
			min={0} /> */}

		<StringInput
			title="Exchange Partner Address"
			tooltip="Enter the address of your friend. He'll receive your deposit only after paying the lightning invoice."
			onChange={handleChangeTaker}
			placeholder="0x..." />

		{theToken.allowance?.lt(tokenAmount) ? <button
			className="fullwidthButton"
			onClick={handleApprove}
			disabled={!data?.account}>Approve</button> : <button
				className="fullwidthButton"
				onClick={handleDeposit}
				disabled={tokenAmount.eq(0) || !taker || !invoice || theToken.deficit}>Deposit</button>}

		{showDepositModal && <DepositModal
			onClose={handleCloseDepositModal}
			secret={secretHash}
			deposited={tokenAmount.shiftedBy(-theToken.decimals).toFixed(appConfig.fraction)}
			depositor={appController.shortenString(data?.account, 4, 4)}
			beneficiary={appController.shortenString(taker, 4, 4)}
			native={theToken.isNative} />}

		{error && <MessageModal
			title={error.title}
			text={error.text}
			onClick={handleCloseError} />}
	</div>
};
