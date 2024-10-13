import React from 'react'
import './Login.scss'

import useApi from '../../api/useApi'
import { FeedbackContext } from '../../contexts/FeedbackContext/FeedbackContext'
import LoadingBlocker from '../../components/LoadingBlocker/LoadingBlocker'
import { useNavigate } from 'react-router'
import usePageTitle from '../../hooks/usePageTitle'

const Login = () => {
	const [loading, setLoading] = React.useState(false)

	usePageTitle('Login')

	const api = useApi()
	const navigate = useNavigate()

	const feedbackContext = React.useContext(FeedbackContext)

	const handleSubmit = (e) => {
		e.preventDefault()
		setLoading(true)
		const { username, password } = e.target.elements
		api
			.doLogin(username.value, password.value)
			.then(() => {
				feedbackContext.indicateSuccess('Logged in successfully')
				navigate('/')
			})
			.catch((e) => feedbackContext.handleException(e))
			.finally(() => setLoading(false))
	}

	return (
		<div className="Login">
			<LoadingBlocker loading={loading}>
				<form onSubmit={handleSubmit}>
					<h1 className="title">Script Helper Admin</h1>
					<label>
						<span>Username</span>
						<input name="username" />
					</label>
					<label>
						<span>Password</span>
						<input name="password" type="password" />
					</label>
					<button type="submit" className="theme">
						Login
					</button>
				</form>
			</LoadingBlocker>
		</div>
	)
}

export default Login
