import { useState } from "react";
import "./Tab.css";

export const Tab = ({
	tabs = [],
	name = "",
	onSelect = () => { }
}) => {
	const [indexSelected, setIndexSelected] = useState(0);

	const handleSelect = event => {
		const idx = parseInt(event.target.id);
		setIndexSelected(idx);
		onSelect(idx);
	};

	return <div className="tabLayout">
		{tabs.map((tab, index) => {
			return <div
				key={tab.label}
				className="option">
				<input
					id={index}
					type="radio"
					name={name}
					checked={index === indexSelected}
					onChange={handleSelect} />

				<label for={index}>
					{tab.label}
				</label>
			</div>
		})}
	</div>
};