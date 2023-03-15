import "./AmountInput.css";

export const StringInput = ({
	title = "",
	onChange = () => { },
	placeholder = ""
}) => {
	const handleChange = event => {
		onChange(event.currentTarget.value);
	};

	return <div className="amountInputLayout">
		<div className="titleBar">
			<div className="title">{title}</div>
		</div>

		<div className="titleBar">

			<input
				type="text"
				onChange={handleChange}
				className="stringInput"
				placeholder={placeholder} />
		</div>
	</div>
};