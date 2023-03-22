import { useEffect, useState } from "react";
import "./AmountInput.css";

export const AmountInput = ({
	title = "",
	tokens = [],
	onTokenSelected = () => { },
	balance = 0,
	showMax = true,
	onChange = () => { },
	min = 1,
	valueForced = 0,
}) => {
	const [tokenSelected, setTokenSelected] = useState(0);
	const theToken = tokens[tokenSelected];
	const maxValue = theToken.balance?.shiftedBy(-theToken.decimals).integerValue().toNumber();
	const [value, setValue] = useState(min);
	const [previousValue, setPreviousValue] = useState(min);

	const handleSelectToken = event => {
		const idx = event.target.selectedIndex;
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

	const handleMax = event => {
		setValue(balance);
		onChange(balance);
	};

	return <div className="amountInputLayout">
		<div className="titleBar">
			<div className="title">{title}</div>

			{showMax > 0 && <div>
				<span>Balance: {theToken.balance?.shiftedBy(-theToken.decimals).toFixed(0)}&nbsp;</span>

				<button onClick={handleMax}>MAX</button>
			</div>}
		</div>

		<div className="titleBar">
			<select
				value={theToken?.symbol}
				onChange={handleSelectToken}>
				{tokens.map(token => {
					return <option
						key={token.symbol}
						value={token.symbol}>
						{token.symbol}
					</option>
				})}
			</select>

			<input
				className="numberInput"
				type="number"
				onChange={handleChange}
				placeholder={0}
				value={value}
				min={min}
				max={maxValue}
				style={{ color: (theToken.balance?.lt(valueForced) || theToken.balance?.lt(value)) ? "red" : "white" }} />
		</div>
	</div>
};