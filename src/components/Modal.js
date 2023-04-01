import "./Modal.css";

export const Modal = ({
	children,
	onClose = () => { }
}) => {
	return <div className="modalMask">
		<div className="modalContainer">
			<img
				className="closeButton"
				src="/images/close.png"
				width="32px"
				alt="close"
				onClick={onClose} />

			<div>{children}</div>
		</div>
	</div>
};