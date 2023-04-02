import { useEffect, useState } from "react";
import "./AmountInput.css";
import { Tooltip } from "./Tooltip";

let originPrice = 0;

export const PriceControl = ({
	title = "",
	tooltip = null,
	defaultPrice = 0,
	onChange = () => { }
}) => {
	const [price, setPrice] = useState(defaultPrice);

	useEffect(() => {
		setPrice(defaultPrice);

		if (originPrice === 0) {
			originPrice = defaultPrice;
		}
	}, [defaultPrice]);

	const updatePrice = newPrice => {
		setPrice(newPrice);
		onChange(newPrice);
	};

	const handleResetPrice = () => {
		setPrice(originPrice);
	};

	const handleReduce = () => {
		const newPrice = price * 0.99;
		updatePrice(newPrice);
	};

	const handleIncrease = () => {
		const newPrice = price * 1.01;
		updatePrice(newPrice);
	};

	return <div
		className="amountInputLayout"
		style={{
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center"
		}}>
		<div>
			{title}

			{tooltip && <Tooltip content={tooltip} />}
		</div>

		<div className="line">
			<span>{price.toFixed(2)}</span>

			<button
				className="tinyButton"
				onClick={handleResetPrice}>reset</button>

			<button
				className="tinyButton"
				onClick={handleReduce}>-1%</button>


			<button
				className="tinyButton"
				onClick={handleIncrease}>+1%</button>
		</div>
	</div>
};