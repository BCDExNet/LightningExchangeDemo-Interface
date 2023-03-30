import { useEffect, useState } from "react";
import "./Tooltip.css";

const TooltipPosition = ({ sup = false, children }) => {
	if (sup) {
		return <sup>{children}</sup>
	} else {
		return children;
	}
};

export const Tooltip = ({
	sup = false,
	content = ""
}) => {
	let timer = null;
	const [isShowContent, setIsShowContent] = useState(false);
	const [contentWidth, setContentWidth] = useState(0);
	const [contentHeight, setContentHeight] = useState(0);

	useEffect(() => {
		if (isShowContent) {
			const dom = document.getElementById("abc");
			setContentWidth(dom.clientWidth);
			setContentHeight(dom.clientHeight);
		}
	}, [isShowContent]);

	const clearTimer = () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	};

	const handleMouseOver = () => {
		setIsShowContent(true);
		clearTimer();
	}

	const handleMouseOut = () => {
		clearTimer();
		timer = setTimeout(() => {
			setIsShowContent(false);
		}, 3000);
	}

	return <>
		<TooltipPosition sup={sup}>
			<span
				className="tooltipIcon"
				onMouseOver={handleMouseOver}
				onMouseOut={handleMouseOut}>
				<span>?</span>

				{isShowContent && <div
					id="abc"
					className="tooltipContent"
					style={{
						top: "-" + contentHeight + "px",
						left: "-" + (contentWidth / 2 - 8) + "px"
					}}>{content}</div>}
			</span>
		</TooltipPosition>

	</>
};