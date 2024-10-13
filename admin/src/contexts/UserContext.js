import React from 'react'
import PropTypes from 'prop-types'
import useApi from '../api/useApi'
import { useNavigate } from 'react-router'

import { FeedbackContext } from '../contexts/FeedbackContext/FeedbackContext'

export const UserContext = React.createContext()

export const UserContextProvider = ({ children }) => {
	const [user, setUser] = React.useState(null)

	const api = useApi()

	const navigate = useNavigate()

	const feedbackContext = React.useContext(FeedbackContext)

	if (user && user.adminLevel < 1) {
		api.doLogout().then(() => {
			navigate('/login')
		})
	}

	React.useEffect(() => {
		if (user === null) {
			if (api.isAuthenticated()) {
				api
					.getMe()
					.then((data) => setUser(data.user))
					.catch((e) => feedbackContext.handleException(e))
			} else {
				navigate('/login')
			}
		}
	}, [user])

	return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

UserContextProvider.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]).isRequired,
}
