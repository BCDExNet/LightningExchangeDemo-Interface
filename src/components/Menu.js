import { useState } from "react";
import { LinkWithIcon } from "./LinkWithIcon";
import "./Menu.css";

export const Menu = () => {
	let timer = null;
	const [isShowOption, setIsShowOptions] = useState(false);

	const clearTimer = () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	};

	const handleOpen = () => {
		setIsShowOptions(!isShowOption);

		clearTimer();
	};

	const handleClick = () => {
		setIsShowOptions(false);
	};

	const handleMouseOut = () => {
		timer = setTimeout(() => {
			setIsShowOptions(false);
		}, 3000);
	};

	return <div className="menuLayout">
		<img
			src="/images/menu.png"
			width="16px"
			alt="menu icon"
			onClick={handleOpen}
			onMouseOut={handleMouseOut} />

		<div
			className="options"
			style={{ display: isShowOption ? "flex" : "none" }}
			onMouseEnter={clearTimer}
			onMouseLeave={handleMouseOut}>
			<LinkWithIcon
				icon="/images/docs.png"
				label="docs"
				url="https://docs.bcdex.net"
				onClick={handleClick}
				fullWidth />

			<LinkWithIcon
				icon="/images/earth.png"
				label="BCDEX.net"
				url="https://bcdex.net"
				onClick={handleClick}
				fullWidth />

			<LinkWithIcon
				icon="/images/twitter.png"
				label="twitter"
				url="https://twitter.com"
				onClick={handleClick}
				fullWidth />

			<LinkWithIcon
				icon="/images/github.png"
				label="github"
				url="https://github.com"
				onClick={handleClick}
				fullWidth />
		</div>
	</div>
};