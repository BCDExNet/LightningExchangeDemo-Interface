import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { AmountInput } from "../components/AmountInput";
import { AmountLabel } from "../components/AmountLabel";
import { PriceControl } from "../components/PriceControl";
import { StringInput } from "../components/StringInput";
import { appController } from "../libs/appController";
import { globalUtils } from "../libs/globalUtils";
import { invoiceDecoder } from "../libs/invoiceDecoder";
import "./MainView.css";

export const C2CView = ({ data = null }) => {
	const [usdcAmount, setUSDCAmount] = useState(globalUtils.constants.BIGNUMBER_ZERO);
	const [btcValue, setBtcValue] = useState(globalUtils.constants.BIGNUMBER_ZERO);
	const [taker, setTaker] = useState("");
	const [btcAmount, setBTCAmount] = useState(0);
	const [expiry, setExpiry] = useState(0);
	const [secretHash, setSecretHash] = useState("");
	const [invoice, setInvoice] = useState("");
	const [price, setPrice] = useState(appController.getBTCPrice());

	useEffect(() => {
		setBtcValue(appController.computeBTCWithUSDC(1, price));
	}, [data?.updated]);

	const handleChange = val => {
		setUSDCAmount(BigNumber(val).shiftedBy(6));
		setBtcValue(appController.computeBTCWithUSDC(val, price));
	};

	const handleChangeBTC = val => {
		setBTCAmount(val);
		setUSDCAmount(appController.computeUSDCWithBTC(val, price));
	}

	const handleChangeTaker = val => {
		setTaker(val);
	};

	const reset = () => {
		setBTCAmount(0);
		setUSDCAmount(globalUtils.constants.BIGNUMBER_ZERO)
		setExpiry(0);
		setSecretHash("");
	};

	const handleChangeInvoice = val => {
		try {
			const decoded = invoiceDecoder.decode(val);
			if (decoded.amount > 0) {
				const sats = decoded.amount / 1000;
				setBTCAmount(sats);
				setUSDCAmount(appController.computeUSDCWithBTC(sats, price));
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
			usdcAmount.toString(),
			taker,
			secretHash,
			expiry,
			invoice,
			() => {
				window.alert("deposit successfully! secretHash = " + secretHash);
			}
		);
	};

	const handleApprove = () => {
		appController.approve(() => {
			// window.location.reload();
		});
	};

	return <div className="subViewLayout">
		<StringInput
			title="LN Invoice"
			onChange={handleChangeInvoice}
			placeholder="lnbc1..."
			qr={true} />

		<AmountInput
			title="You Sell"
			balance={data?.usdcBalance?.shiftedBy(-6).toNumber()}
			symbol="USDC"
			tokenName="USD Coin"
			onChange={handleChange}
			valueForced={usdcAmount.shiftedBy(-6).toNumber()}
			deficit={usdcAmount.gt(data?.usdcBalance)} />

		<AmountInput
			title="You Buy"
			symbol="LN BTC(Sat)"
			tokenName="Wrapped BTC"
			valueForced={btcAmount}
			onChange={handleChangeBTC}
			min={0}
			max={Number.MAX_SAFE_INTEGER}
			balance={Number.MAX_SAFE_INTEGER}
			showMax={false} />

		<PriceControl
			title="USDC per WBTC (+1.17%)"
			defaultPrice={appController.getBTCPrice()}
			onChange={handleUpdatePrice} />

		<StringInput
			title="Taker Address"
			onChange={handleChangeTaker}
			placeholder="0x..." />

		{data?.allowance?.lt(usdcAmount) ? <button
			className="fullwidthButton"
			onClick={handleApprove}>Approve</button> : <button
				className="fullwidthButton"
				onClick={handleDeposit}
				disabled={usdcAmount.eq(0) || !taker || !invoice || usdcAmount.gt(data?.usdcBalance)}>Deposit</button>}
	</div>
};
