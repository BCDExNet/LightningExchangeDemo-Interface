import { useEffect, useState } from "react";
import "./AmountInput.css";

export const PriceControl = ({
	title = "",
	defaultPrice = 0,
	onChange = () => { }
}) => {
	const [price, setPrice] = useState(defaultPrice);

	useEffect(() => {
		setPrice(defaultPrice)
	}, [defaultPrice]);

	const updatePrice = newPrice => {
		setPrice(newPrice);
		onChange(newPrice);
	};

	const handleReduce = () => {
		const newPrice = price * 0.99;
		updatePrice(newPrice);
	};

	const handleIncrease = () => {
		const newPrice = price * 1.01;
		updatePrice(newPrice);
	};

	return <div className="amountInputLayout">
		<div>{title}</div>

		<div className="line">
			<button
				className="smallButton"
				onClick={handleReduce}>-1%</button>

			<span>{price}</span>

			<button
				className="smallButton"
				onClick={handleIncrease}>+1%</button>
		</div>
	</div>
};