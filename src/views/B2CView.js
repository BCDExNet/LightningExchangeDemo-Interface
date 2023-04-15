import { useEffect, useState } from "react";
import { AmountLabel } from "../components/AmountLabel";
import { StringInput } from "../components/StringInput";
import { appConfig } from "../configs/appConfig";
import { appController } from "../libs/appController";
import { globalUtils } from "../libs/globalUtils";
import { invoiceDecoder } from "../libs/invoiceDecoder";
import { MessageModal } from "./MessageModal";
import "./MainView.css";
import { DepositModal } from "./DepositModal";

export const B2CView = ({ data = null }) => {
	const taker = appController.config.b2cTaker;
	const [tokenAmount, setTokenAmount] = useState(globalUtils.constants.BIGNUMBER_ZERO);
	const [invoice, setInvoice] = useState("");
	const [btcAmount, setBTCAmount] = useState(0);
	const [expiry, setExpiry] = useState(0);
	const [secretHash, setSecretHash] = useState("");
	const [tokenToSellSelected, setTokenToSellSelected] = useState(0);
	const [error, setError] = useState(null);
	const [showDepositeModal, setShowDepositeModal] = useState(false);
	const tokens = data?.tokens ?? [];
	const theToken = tokens[tokenToSellSelected];

	const updateTokenData = async index => {
		const theToken = tokens[index];
		const result = await appController.getDataWithToken(theToken.symbol, theToken.isNative);
		theToken.allowance = result.allowance;
		theToken.balance = result.balance;
	};

	const recomputeAmountToSell = (index, sats) => {
		const theToken = tokens[index];
		let howMuchToken = globalUtils.constants.BIGNUMBER_ZERO;

		if (sats > 0) {
			howMuchToken = appController.computeTokenWithBTC(sats, theToken.symbol);
		}
		theToken.value = howMuchToken.shiftedBy(-theToken.decimals);
		theToken.deficit = howMuchToken.gt(theToken.balance);
		theToken.fee = appController.computeTokenWithBTC(appConfig.fee, theToken.symbol).shiftedBy(-theToken.decimals);

		setTokenAmount(howMuchToken.integerValue());
	};

	useEffect(() => {
		return () => {
			tokens.forEach(item => {
				item.value = null;
				item.deficit = false
			});
		}
	}, []);

	useEffect(() => {
		if (data) {
			updateTokenData(0);
		}
	}, [data]);

	const init = () => {
		setBTCAmount(0);
		setTokenAmount(globalUtils.constants.BIGNUMBER_ZERO);
		setExpiry(0);
		setSecretHash("");
		recomputeAmountToSell(tokenToSellSelected, 0);
	};

	const handleChangeInvoice = val => {
		if (!val || val.length === 0) {
			return init();
		}

		try {
			const decoded = invoiceDecoder.decode(val);
			if (decoded.amount > 0 && decoded.amount < appConfig.btcLimit * globalUtils.constants.SAT_RATE) {
				const sats = decoded.amount / globalUtils.constants.SAT_RATE;

				recomputeAmountToSell(tokenToSellSelected, sats + appConfig.fee);

				setBTCAmount(sats);
				setExpiry(decoded.timeStamp + decoded.expiry + 3600);
				setSecretHash("0x" + decoded.paymentHash);
				setInvoice(val);
			} else {
				setError({
					title: globalUtils.constants.SOMETHING_WRONG,
					text: "Amount is 0 or more than " + appConfig.btcLimit
				});

				init();
			}
		} catch (error) {
			setError({
				title: globalUtils.constants.SOMETHING_WRONG,
				text: error.message
			});
			console.error(error);
		}
	};

	const handleApprove = () => {
		appController.approve(
			theToken?.symbol,
			() => {
				setTimeout(() => {
					recomputeAmountToSell(tokenToSellSelected, btcAmount + appConfig.fee);

					setTimeout(() => {
						if (tokenAmount.gt(0) && taker && invoice && !theToken?.deficit && secretHash && expiry > 0) {
							handleDeposit();
						}
					}, 1000);
				}, 6000);
			}
		);
	};

	const handleDeposit = () => {
		appController.deposit(
			theToken?.symbol,
			tokenAmount.toFixed(),
			taker,
			secretHash,
			expiry,
			invoice,
			() => {
				setShowDepositeModal(true);
			},
			err => {
				setShowDepositeModal(false);

				setError({
					title: globalUtils.constants.SOMETHING_WRONG,
					text: err.message.length < 100 ? err.message : globalUtils.constants.REVERTED_MESSAGE
				});
			},
			theToken.isNative
		);
	};

	const handleSelectToken = async idx => {
		await updateTokenData(idx);
		setTokenToSellSelected(idx);
		recomputeAmountToSell(idx, btcAmount + appConfig.fee);
	};

	const handleCloseError = () => {
		setError(null);
		init();
	}

	const handleCloseDepositeModal = () => {
		setShowDepositeModal(false);
		init();
	};

	const handleClearInvoice = () => {
		init();
	};

	return <>
		<div className="subViewLayout">
			<StringInput
				title="Invoice"
				tooltip={<>Generate an invoice in a wallet that supports the lighting network, then scan it or paste it's ID.<br /><a href="https://youtu.be/5gQNeiWz304" target="_blank" rel="noreferrer">click for details</a></>}
				onChange={handleChangeInvoice}
				placeholder="lnbc1..."
				qr={true}
				onClear={handleClearInvoice} />

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
						<div>{btcAmount.toFixed(0)}&nbsp;sat</div>
						<div className="subTitle">{data && appController.sat2btc(btcAmount).multipliedBy(appController.getBTCPrice("usdc")).toFixed(2)}&nbsp;USD</div>
					</div>
				</div>
			</div>

			<AmountLabel
				title="deposit"
				tooltip="Choose what asset to deposit in exchange for the lighting invoice amount."
				tokens={tokens}
				onTokenSelected={handleSelectToken} />

			{theToken?.allowance?.lt(tokenAmount) ? <button
				className="fullwidthButton"
				onClick={handleApprove}
				disabled={!data?.account}>Approve</button> : <button
					className="fullwidthButton"
					onClick={handleDeposit}
					disabled={tokenAmount.eq(0) || !taker || !invoice || theToken?.deficit}>Deposit</button>}
		</div>

		{error && <MessageModal
			title={error.title}
			text={error.text}
			onClick={handleCloseError} />}

		{showDepositeModal && <DepositModal
			onClose={handleCloseDepositeModal}
			secret={secretHash}
			deposited={tokenAmount.shiftedBy(-theToken.decimals).toFixed(appConfig.fraction)}
			depositor={appController.shortenString(data?.account, 4, 4)}
			beneficiary={appController.shortenString(taker, 4, 4)}
			native={theToken.isNative} />}
	</>
};
