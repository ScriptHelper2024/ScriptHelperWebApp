import React from 'react'
import PropTypes from 'prop-types'
import './PageContextMenu.scss'

import useApi from '../../api/useApi'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	//faBell,
	faUser,
	faChevronDown,
} from '@fortawesome/free-solid-svg-icons'
import PopupMenu, {
	PopupMenuMenu,
	PopupMenuMenuItem,
} from '../PopupMenu/PopupMenu'

import { UserContext } from '../../contexts/UserContext'
import { FeedbackContext } from '../../contexts/FeedbackContext/FeedbackContext'

const PageContextMenu = ({ title, breadcrumb }) => {
	const user = React.useContext(UserContext)
	const email = user?.email
	const api = useApi()
	const navigate = useNavigate()
	const feedbackContext = React.useContext(FeedbackContext)

	const doLogout = () => {
		feedbackContext.indicateSuccess('Logged out successfully.')
		api.doLogout().then(() => navigate('/'))
	}

	return (
		<div className="PageContextMenu">
			<h1 className="page-title">
				{breadcrumb?.length && (
					<div className="breadcrumb">
						{breadcrumb.map((item) => (
							<React.Fragment key={item}>
								{item}
								<span>&gt;</span>
							</React.Fragment>
						))}
					</div>
				)}
				{title}
			</h1>
			<div className="context-menu">
				{/*
				<div className="notifications">
					<FontAwesomeIcon icon={faBell} />
					<div className="quantity">
						<span>3</span>
					</div>
				</div>
				*/}

				<div className="user-menu-toggle">
					<PopupMenu>
						<FontAwesomeIcon icon={faUser} className="icon" />
						{email}
						<FontAwesomeIcon icon={faChevronDown} className="menu-indicator" />
						<PopupMenuMenu right>
							<PopupMenuMenuItem>
								<button onClick={() => navigate('/account-settings')}>Account</button>
							</PopupMenuMenuItem>
							<PopupMenuMenuItem separator>
								<button onClick={doLogout}>Logout</button>
							</PopupMenuMenuItem>
						</PopupMenuMenu>
					</PopupMenu>
				</div>
			</div>
		</div>
	)
}

PageContextMenu.propTypes = {
	title: PropTypes.string,
	breadcrumb: PropTypes.array,
}

export default PageContextMenu
