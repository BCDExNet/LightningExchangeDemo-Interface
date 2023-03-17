import { useState } from "react";
import "./AmountInput.css";

export const AmountInput = ({
	title = "",
	balance = 0,
	symbol = "",
	tokenName = "",
	onChange = () => { },
	min = 1,
	max = 0
}) => {
	const maxValue = max > 0 ? Math.min(max, balance) : balance;
	const [value, setValue] = useState(min);
	const [previousValue, setPreviousValue] = useState(min);

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

			<div>
				<span>Balance: {balance}&nbsp;</span>

				<button onClick={handleMax}>MAX</button>
			</div>
		</div>

		<div className="titleBar">
			<div>{symbol}&nbsp;</div>

			<input
				className="numberInput"
				type="number"
				onChange={handleChange}
				placeholder={0}
				value={value}
				min={min}
				max={maxValue} />
		</div>
	</div>
};