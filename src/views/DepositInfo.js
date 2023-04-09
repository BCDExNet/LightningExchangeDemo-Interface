import BigNumber from "bignumber.js";
import { toCanvas } from "qrcode";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { KeyAndValueInLine } from "../components/KeyAndValueInLine";
import { SecretHashLabel } from "../components/SecretHashLabel";
import { StringInput } from "../components/StringInput";
import { Tooltip } from "../components/Tooltip";
import { appConfig } from "../configs/appConfig";
import { appController } from "../libs/appController";
import { globalUtils } from "../libs/globalUtils";
import { invoiceDecoder } from "../libs/invoiceDecoder";
import "./DepositInfo.css";

const DepositInfo = ({ chainId = 0 }) => {
	const { secret } = useParams();
	const [searchParams, setSearchParams] = useSearchParams();
	const native = Boolean(parseInt(searchParams.get("native")));
	const [data, setData] = useState(null);
	const [preimage, setPreimage] = useState("");
	const [amountInInvoice, setAmountInInvoice] = useState(0);
	const [theToken, setTheToken] = useState(null);

	useEffect(() => {
		if (chainId > 0 && data) {
			setTheToken(Object.values(appConfig.exchanges[chainId].tokens).find(item => {
				if (data.token) {
					return item.address?.toLocaleLowerCase() === data.token?.toLocaleLowerCase()
				} else {
					return item.isNative;
				}
			}));
		}
	}, [chainId, data]);

	const parseInvoice = invoice => {
		try {
			const decoded = invoiceDecoder.decode(invoice);
			setAmountInInvoice(decoded.amount / 1000);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		const getData = async () => {
			const result = await appController.getDepositInfo(secret, native);

			setData(result);

			parseInvoice(result.invoice);

			toCanvas(
				document.getElementById("qr"),
				result.invoice,
				function (error) {
					if (error) console.error(error)
				}
			);
		};

		setTimeout(() => {
			getData();
		}, 3000);
	}, [secret]);

	const handleChangePreimage = val => {
		if (val.indexOf(globalUtils.constants.HEX_PREFIX) !== 0) {
			setPreimage(globalUtils.constants.HEX_PREFIX + val);
		} else {
			setPreimage(val);
		}
	};

	const handleWithdraw = event => {
		appController.withdraw(
			preimage,
			() => {
				window.alert("Withdrawn!");
			},
			null,
			native
		);
	};

	return <div className="depositInfoLayout">
		<h3>Check Details<Tooltip
			sup={true}
			content="Check that all the details are correct before paying the invoice." /></h3>

		<SecretHashLabel secret={secret} />

		{data && <>
			<div className="row">
				{theToken && <div className="halfWidthItem">
					<div className="key">Token Name:</div>
					<div className="value">{theToken.name}</div>
				</div>}

				<div className="halfWidthItem">
					<div className="key">Token Address:</div>
					<div className="value">{appController.shortenString(data.token, 6, 4)}</div>
				</div>
			</div>

			{theToken && <KeyAndValueInLine
				keyStr="amount"
				value={<div className="multiValues">
					<span className="subValue">~{BigNumber(data.amount).shiftedBy(-theToken.decimals).multipliedBy(appController.getTokenPrice(theToken.symbol)).toFixed(2)}&nbsp;USD</span>

					<span>{BigNumber(data.amount).shiftedBy(-theToken.decimals).toFixed()}&nbsp;{theToken.symbol}</span>

					{theToken?.logo && <img
						src={theToken.logo}
						height="24px"
						alt="token logo" />}
				</div>} />}

			<KeyAndValueInLine
				keyStr="depositor"
				value={appController.shortenString(data.depositor, 6, 4)} />

			<KeyAndValueInLine
				keyStr="Beneficiary"
				value={appController.shortenString(data.beneficiary, 6, 4)} />

			<p />

			<h3>Payment<Tooltip
				sup={true}
				content="Pay the invoice and receive the sum deposited by your friend." /></h3>

			<KeyAndValueInLine
				keyStr="Amount In Invoice"
				value={amountInInvoice} />

			<KeyAndValueInLine
				keyStr="Invoice ID"
				value={<div className="value">
					{appController.shortenString(data.invoice, 5, 3)}

					{/* <button className="tinyButton">
				<img src="/images/copy.png" height="16px" alt="copy" />
				<span>copy</span>
			</button> */}
				</div>} />
		</>}

		<div style={{
			textAlign: "center",
			width: "100%"
		}}>
			<canvas id="qr" />
		</div>

		<p />

		{!(data?.withdrawn) && <>
			<StringInput
				title="Proof of Payment (Preimage)"
				tooltip="You can find the payment preimage in the wallet you used to pay the invoice."
				onChange={handleChangePreimage}
				placeholder="0x..." />

			<button
				className="fullwidthButton"
				onClick={handleWithdraw}>Withdraw</button>
		</>}
	</div>
};

export default DepositInfo;