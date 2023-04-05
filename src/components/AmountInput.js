import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { appController } from "../libs/appController";
import "./AmountInput.css";
import { Select } from "./Select";
import { Tooltip } from "./Tooltip";

export const AmountInput = ({
	title = "",
	tooltip = null,
	tokens = [],
	onTokenSelected = () => { },
	// balance = 0,
	showMax = true,
	onChange = () => { },
	min = 0,
	valueForced = 0,
}) => {
	const [tokenSelected, setTokenSelected] = useState(0);
	const theToken = tokens[tokenSelected];
	const maxValue = theToken.balance?.shiftedBy(-theToken.decimals).integerValue().toNumber();
	const [value, setValue] = useState(min);
	const [previousValue, setPreviousValue] = useState(min);

	const handleSelectToken = idx => {
		setTokenSelected(idx);
		onTokenSelected(idx);
	};

	useEffect(() => {
		if (valueForced > 0) {
			setValue(valueForced)
		}
	}, [valueForced]);

	const handleChange = event => {
		const val = Number(event.currentTarget.value);
		setValue(val);

		setTimeout(() => {
			if (!isNaN(val) && val <= maxValue && val >= min) {
				onChange(val);
				setPreviousValue(val);
			} else {
				setValue(previousValue);
			}
		}, 1000);
	};

	const handleMax = () => {
		const val = theToken.balance?.shiftedBy(-theToken.decimals).toNumber();
		setValue(val);
		onChange(val);
	};

	return <div className="amountInputLayout">
		<div className="amountInputTitleBar">
			<div className="title">
				{title}

				{tooltip && <Tooltip content={tooltip} />}
			</div>

			{showMax > 0 && <div style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "center"
			}}>
				<span>Balance: {theToken.balance?.shiftedBy(-theToken.decimals).toFixed()}&nbsp;</span>

				<button
					className="tinyButton"
					onClick={handleMax}>Max</button>
			</div>}
		</div>

		<div
			className="amountInputTitleBar"
			style={{
				padding: "8px 16px 8px 8px",
				gap: "6px",
				background: "#3C3C3C",
				borderRadius: "12px",
				width: "calc(100% - 24px)"
			}}>
			<Select
				value={tokenSelected}
				onChange={handleSelectToken}
				showCheckIcon={false}
				options={tokens.map(token => {
					return <div
						className="tokenOptionLayout"
						key={token.symbol}
						value={token.symbol}>
						{token.logo && <img
							src={token.logo}
							height="24px"
							alt="token logo" />}

						<div>
							<div className="tokenSymbol">{token.symbol}</div>

							<div className="tokenName">{token.name}</div>
						</div>
					</div>
				})} />

			<div className="numberInput">
				<input
					type="number"
					onChange={handleChange}
					placeholder={0}
					value={value}
					min={min}
					max={maxValue}
					style={{ color: (theToken?.deficit || theToken.balance?.lt(valueForced) || theToken.balance?.lt(value)) ? "red" : "white" }} />

				<div className="subValue">{theToken?.symbol && (valueForced || value) ? BigNumber((valueForced || value)).multipliedBy(appController.getTokenPrice(theToken?.symbol)).toFixed(2) : 0}&nbsp;USD</div>
			</div>
		</div>
	</div>
};