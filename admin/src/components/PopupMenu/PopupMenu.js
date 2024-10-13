import React from 'react'
import PropTypes from 'prop-types'
import './PopupMenu.scss'

const PopupMenu = ({ closeOnItemClick, closeOnMouseLeave, children }) => {
	const [menuActive, setMenuActive] = React.useState(false)

	return (
		<div
			className={`PopupMenu ${menuActive ? 'active' : ''}`}
			onClick={(e) => {
				if (closeOnItemClick || e.currentTarget === e.target) {
					setMenuActive(!menuActive)
				}
			}}
			onMouseLeave={() => (closeOnMouseLeave ? setMenuActive(false) : undefined)}
		>
			{React.Children.map(children, (child) => child)}
		</div>
	)
}

export default PopupMenu

export const PopupMenuMenu = ({ right, children }) => {
	return (
		<nav className={`PopupMenuMenu ${right ? 'right' : ''}`}>
			<ul>{React.Children.map(children, (child) => child)}</ul>
		</nav>
	)
}

export const PopupMenuMenuItem = ({ children, separator }) => {
	return (
		<li className={`PopupMenuMenuItem ${separator ? 'separator' : ''}`}>
			{children}
		</li>
	)
}

PopupMenu.propTypes = {
	closeOnItemClick: PropTypes.bool,
	closeOnMouseLeave: PropTypes.bool,
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]).isRequired,
}

PopupMenuMenu.propTypes = {
	right: PropTypes.bool,
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]).isRequired,
}

PopupMenuMenuItem.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]).isRequired,
	separator: PropTypes.bool,
}
