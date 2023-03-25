import BigNumber from "bignumber.js";
import { toCanvas } from "qrcode";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { StringInput } from "../components/StringInput";
import { appConfig } from "../configs/appConfig";
import { appController } from "../libs/appController";
import { globalUtils } from "../libs/globalUtils";
import { invoiceDecoder } from "../libs/invoiceDecoder";
import "./DepositInfo.css";

const DepositInfo = ({ chainId = 0 }) => {
	const { secret } = useParams();
	const [data, setData] = useState(null);
	const [preimage, setPreimage] = useState("");
	const [amountInInvoice, setAmountInInvoice] = useState(0);
	const [theToken, setTheToken] = useState(null);

	useEffect(() => {
		if (chainId > 0 && data) {
			setTheToken(Object.values(appConfig.exchanges[chainId].tokens).find(item => item.address.toLocaleLowerCase() === data.token.toLocaleLowerCase()));
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
			const result = await appController.getDepositInfo(secret);

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
			}
		);
	};

	return <div className="depositInfoLayout">
		<div className="item">
			<span>Secret Hash:</span>
			<span>{secret.substring(0, 12) + "..."}</span>
		</div>

		{data && <>
			<div className="item">
				<span>Depositor:</span>
				<span>{data.depositor.substring(0, 12) + "..."}</span>
			</div>

			<div className="item">
				<span>Beneficiary:</span>
				<span>{data.beneficiary.substring(0, 12) + "..."}</span>
			</div>

			{theToken && <div className="item">
				<span>Token Name:</span>
				<span>{theToken.name}</span>
			</div>}

			<div className="item">
				<span>Token Address:</span>
				<span>{data.token.substring(0, 12) + "..."}</span>
			</div>

			{theToken && <div className="item">
				<span>Amount:</span>
				<span>{BigNumber(data.amount).shiftedBy(-theToken.decimals).toFixed()}</span>
			</div>}

			<div className="item">
				<span>Amount In Invoice:</span>
				<span>{amountInInvoice}</span>
			</div>
		</>}

		<div style={{ textAlign: "center" }}>
			<canvas id="qr" />
		</div>

		{!(data?.withdrawn) && <>
			<StringInput
				title="preimage/secret"
				onChange={handleChangePreimage}
				placeholder="0x..." />

			<button
				className="fullwidthButton"
				onClick={handleWithdraw}>Withdraw</button>
		</>}
	</div>
};

export default DepositInfo;