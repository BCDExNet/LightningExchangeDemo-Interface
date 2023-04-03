import { useEffect, useState } from "react";
import { LinkWithIcon } from "../components/LinkWithIcon";
import "./Footer.css";

export const Footer = () => {
	const [pageIsShort, setPageIsShort] = useState(false);

	useEffect(() => {
		window.addEventListener("resize", () => {
			setPageIsShort(document.body.clientHeight < window.innerHeight);
		});
	}, []);

	return <>
		<div
			id="theFooter"
			className="footerLayout"
			style={{ position: pageIsShort ? "absolute" : "relative" }}>
			<img
				src="/images/logo.png"
				height="26px"
				alt="logo" />

			<div className="menus">
				<LinkWithIcon
					icon="/images/docs.png"
					label="docs"
					url="https://docs.bcdex.net" />

				<LinkWithIcon
					icon="/images/earth.png"
					label="BCDEX.net"
					url="https://bcdex.net" />

				<LinkWithIcon
					icon="/images/twitter.png"
					label="twitter"
					url="https://twitter.com/bcde2009" />

				<LinkWithIcon
					icon="/images/github.png"
					label="github"
					url="https://github.com/BCDExNet" />
			</div>
		</div>

		<div className="copyright">© BCDEX 2023</div>
	</>
};