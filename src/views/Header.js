import "./Header.css";
import { appConfig } from "../configs/appConfig";
import { appController } from "../libs/appController";
import { Select } from "../components/Select";
import { Menu } from "../components/Menu";

export const Header = ({
	account = "",
	chainId = 1
}) => {
	const networks = Object.values(appConfig.networks);

	const handleSwitchNetwork = selectedIndex => {
		appController.switchNetwork(selectedIndex);
	};

	return <div className="headerLayout">
		<div className="menu">
			<img
				src="/images/logo.png"
				height="26px"
				alt="logo" />

			{/* <a href="/">Lightning Network Exchange Demo</a>

			<a
				href="https://docs.bcdex.net"
				target="_blank"
				rel="noreferrer">Doc</a>

			<a>How It Work</a> */}
		</div>

		<div className="menu">
			<Select
				onChange={handleSwitchNetwork}
				value={(networks.findIndex(item => item.chainId === chainId))}
				options={networks.map((network, index) => {
					return <div
						className="optionLayout"
						key={network.chain}
						value={network.chainId}>
						{network.iconUrls.length > 0 && <img
							src={network.iconUrls[0]}
							height="16px"
							alt="network logo" />}

						<span className="title">
							<div>{network.chainName}</div>
							<div className="subTitle">{network.chain}</div>
						</span>
					</div>
				})} />

			{account && <div className="label">
				<img src="/images/mm.png"
					height="24px"
					alt="metamask logo" />

				<span>
					{appController.shortenString(account, 5, 3)}
				</span>
			</div>}

			<Menu />
		</div>
	</div>
};