import { appController } from "../libs/appController";
import "./SecretHashLabel.css";

export const SecretHashLabel = ({ secret = "" }) => {
	return <div className="secretHashLabelLayout">
		<img
			src="/images/hash_icon.png"
			height="19px"
			alt="hash icon" />

		<div>
			<div className="key">Deposit Secret Hash</div>
			<div className="value">{appController.shortenString(secret, 6, 4)}</div>
		</div>
	</div>
};