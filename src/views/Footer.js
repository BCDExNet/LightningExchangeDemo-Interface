import { LinkWithIcon } from "../components/LinkWithIcon";
import "./Footer.css";

export const Footer = () => {
	return <div className="footerLayout">
		<img
			src="/images/logo.png"
			height="26px"
			alt="logo" />

		<div>
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
					url="https://twitter.com" />

				<LinkWithIcon
					icon="/images/github.png"
					label="github"
					url="https://github.com" />
			</div>

			<div className="copyright">© BCDEX 2023</div>
		</div>
	</div>
};