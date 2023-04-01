import "./MessageModal.css";
import { Modal } from "../components/Modal";
import { globalUtils } from "../libs/globalUtils";

export const MessageModal = ({
	title = "",
	text = "",
	type = globalUtils.messageType.ERROR,
	onClick = () => { }
}) => {
	const illu = typ => {
		let imgUrl = "";

		switch (typ) {
			case globalUtils.messageType.DONE:
				imgUrl = "/images/deposit.png";
				break;

			case globalUtils.messageType.INFO:
				break;

			default:
				imgUrl = "/images/error_illu.png";
				break;
		}

		return imgUrl ? <img
			src={imgUrl}
			width="180px"
			alt="message icon" /> : null;
	};

	const icon = typ => {
		let imgUrl = "";

		switch (typ) {
			case globalUtils.messageType.DONE:
				imgUrl = "/images/success_stamp.png";
				break;

			case globalUtils.messageType.INFO:
				break;

			default:
				imgUrl = "/images/error_stamp.png"
				break;
		}

		return imgUrl ? <img
			src={imgUrl}
			width="18px"
			alt="message icon" /> : null;
	};

	return <Modal>
		<div className="errorModalLayout">
			{illu(type)}

			<h3>{title}&nbsp;{icon(type)}</h3>

			{text && <div className="text">
				{text}
			</div>}

			<button
				className="fullwidthButton"
				style={{ backgroundColor: "transparent" }}
				onClick={onClick}>close</button>
		</div>
	</Modal>
};