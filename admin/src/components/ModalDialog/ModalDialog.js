import React from 'react'
import PropTypes from 'prop-types'
import './ModalDialog.scss'

const ModalDialog = ({
	className = '',
	isOpen,
	onClose,
	closeOnEsc = true,
	children,
}) => {
	React.useEffect(() => {
		if (closeOnEsc) {
			const EscapePressed = () => {
				onClose()
			}
			const OnEscapePressed = (event) => event.key === 'Escape' && EscapePressed()
			document.addEventListener('keydown', OnEscapePressed)
			return () => {
				document.removeEventListener('keydown', OnEscapePressed)
			}
		}
	}, [])

	return (
		<div className={`ModalDialog ${isOpen ? 'open' : ''} ${className}`}>
			<div className="overlay" onClick={() => (onClose ? onClose() : undefined)} />
			<div className="content">{children}</div>
		</div>
	)
}

ModalDialog.propTypes = {
	className: PropTypes.string,
	isOpen: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
	closeOnEsc: PropTypes.bool,
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]).isRequired,
}

export default ModalDialog
