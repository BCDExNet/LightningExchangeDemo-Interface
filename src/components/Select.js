import { useEffect, useState } from "react";
import "./Select.css";

export const Select = ({
	options = [],
	onChange = () => { },
	value = 0,
	showCheckIcon = true
}) => {
	const [indexSelected, setIndexSelected] = useState(value);
	const [isShowOption, setIsShowOptions] = useState(false);

	useEffect(() => {
		setIndexSelected(value);
	}, [value])

	const handleSelect = event => {
		setIsShowOptions(!isShowOption);
	}

	const handleSelectOne = event => {
		const idx = parseInt(event.currentTarget.id);
		// setIndexSelected(idx);
		onChange(idx);
		setIsShowOptions(false);
	};

	return <div className="selectLayout">
		<div
			className="select"
			onClick={handleSelect}>{options[indexSelected]}</div>

		<div
			className="options"
			style={{ display: isShowOption ? "block" : "none" }}>
			{options.map((option, index) => {
				return <div
					id={index}
					key={index}
					className="option"
					onClick={handleSelectOne}>
					{showCheckIcon && <div
						className="checked"
						style={{ visibility: index === indexSelected ? "visible" : "hidden" }}>✓</div>}

					{option}
				</div>
			})}
		</div>
	</div >
};