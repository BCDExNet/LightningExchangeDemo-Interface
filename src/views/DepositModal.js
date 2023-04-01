import { KeyAndValueInLine } from "../components/KeyAndValueInLine";
import { SecretHashLabel } from "../components/SecretHashLabel";
import "./DepositModal.css";

export const DepositModal = () => {
	return <div className="depositModalLayout">
		<img
			src="/images/deposit.png"
			width="180px"
			alt="deposit" />

		<h3>Deposit Successful!&nbsp;<img src="/images/success_stamp.png" width="18px" alt="success stamp" /></h3>

		<SecretHashLabel secret="asdfasd" />

		<KeyAndValueInLine
			keyStr="Deposited"
			value="123" />

		<KeyAndValueInLine
			keyStr="Deposited"
			value="123" />

		<KeyAndValueInLine
			keyStr="Deposited"
			value="123" />

		<div className="tipBlock">
			<h3>share</h3>

			<div>Send the link to your exchange partner so that he can complete the transaction</div>

			<button className="smallButton">
				<img
					src="/images/copy_black.png"
					height="16px"
					alt="copy" />

				<span>copy link</span>
			</button>
		</div>

		<button
			className="fullwidthButton"
			style={{ backgroundColor: "transparent" }}>close</button>
	</div>
};