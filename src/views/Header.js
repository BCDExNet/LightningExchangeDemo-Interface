import "./Header.css";
import { appConfig } from "../configs/appConfig";
import { appController } from "../libs/appController";

export const Header = ({
	account = "",
	chainId = 1
}) => {
	const networks = Object.values(appConfig.networks);

	const handleSwitchNetwork = event => {
		appController.switchNetwork(event.target.selectedIndex);
	};

	return <div className="headerLayout">
		<div className="menu">
			<h1>BCDEx</h1>

			<a href="/">Lightning Network Exchange Demo</a>

			<a
				href="https://docs.bcdex.net"
				target="_blank"
				rel="noreferrer">Doc</a>

			<a>How It Work</a>
		</div>

		<div className="menu">
			{account && <div className="label">
				{account.substring(0, 10) + "..."}
			</div>}

			<select
				onChange={handleSwitchNetwork}
				value={(networks.find(item => item.chainId === chainId))?.chainId}>
				{networks.map((network, index) => {
					return <option
						key={network.chain}
						value={network.chainId}>
						{network.chainName}
					</option>
				})}
			</select>
		</div>
	</div>
};