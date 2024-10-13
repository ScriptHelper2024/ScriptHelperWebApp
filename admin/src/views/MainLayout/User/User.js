import React from 'react'
import './User.scss'

import usePageTitle from '../../../hooks/usePageTitle'
import { useParams, Link } from 'react-router-dom'
import useApi from '../../../api/useApi'
import { FeedbackContext } from '../../../contexts/FeedbackContext/FeedbackContext'
import FormikErrorMessageHelper from '../../../util/FormikErorMessageHelper'
import LoadingBlocker from '../../../components/LoadingBlocker/LoadingBlocker'
import PageContextMenu from '../../../components/PageContextMenu/PageContextMenu'
import { useNavigate } from 'react-router-dom'
import formatDate from '../../../util/formatDate'
import formatYesNo from '../../../util/formatYesNo'
import TabPanel, { TabPanelPanel } from '../../../components/TabPanel/TabPanel'
import UserAccountForm from '../../../components/UserAccountForm/UserAccountForm'
import UserPreferencesForm from '../../../components/UserPreferencesForm/UserPreferencesForm'
import formatCurrencyType from '../../../util/formatCurrencyType'

const User = () => {
	const [user, setUser] = React.useState(null)
	const [loadingUser, setLoadingUser] = React.useState(false)
	const [userPreferences, setUserPreferences] = React.useState(null)
	const [loadingUserPreferences, setLoadingUserPreferences] =
		React.useState(false)

	usePageTitle('User Profile')

	const { userId } = useParams()
	const navigate = useNavigate()

	const feedbackContext = React.useContext(FeedbackContext)
	const api = useApi()

	React.useEffect(() => {
		if (userId) {
			setLoadingUser(true)
			api
				.getUser(userId)
				.then((data) => setUser(data.user))
				.catch((e) => feedbackContext.handleException(e))
				.finally(() => setLoadingUser(false))

			setLoadingUserPreferences(true)
			api
				.getUserPreferencesByUser(userId)
				.then((data) => setUserPreferences(data))
				.catch((e) => feedbackContext.handleException(e))
				.finally(() => setLoadingUserPreferences(false))

		}
	}, [userId])

	const handleAccountUpdate = (values, setFieldError) => {
		return api
			.updateUser(
				user.id,
				values.email,
				values.firstName,
				values.lastName,
				values.password
			)
			.then((data) => {
				setUser(data.user)
				feedbackContext.indicateSuccess('User Account updated')
			})
			.catch((e) => {
				if (e?.graphQLErrors) {
					const helper = new FormikErrorMessageHelper(setFieldError, {
						'Email already in use': {
							field: 'email',
							message: 'Email already in use',
						},
						'Password must be at least 6 characters long': {
							field: 'password',
							message: 'Password must be at least 6 characters long',
						},
					})
					if (!helper.handleAll(e?.graphQLErrors)) {
						helper.unhandled.forEach((error) => {
							feedbackContext.handleException(error)
						})
					}
				} else {
					feedbackContext.handleException(e)
				}
			})
	}

	const handleAccountDelete = () => {
		const email = user.email
		if (
			confirm(
				'Are you sure you want to delete this user?\n\nNote: This action cannot be undone.'
			)
		) {
			setLoadingUser(true)
			api
				.deleteUser(user.id)
				.then(() => feedbackContext.indicateSuccess('User deleted: ' + email))
				.catch((e) => feedbackContext.handleException(e))
				.finally(() => navigate('/users'))
		}
	}

	const handlePreferencesUpdate = (values) => {
		setLoadingUserPreferences(true)
		return api
			.updateUserPreferences(user.id, values)
			.then((data) => {
				setUserPreferences(data.userPreference)
				feedbackContext.indicateSuccess('User Preferences updated')
			})
			.catch((e) => feedbackContext.handleException(e))
			.finally(() => setLoadingUserPreferences(false))
	}

	const breadcrumb = [
		// eslint-disable-next-line react/jsx-key
		<Link to="/users">Users</Link>,
	]

	return (
		<div className="User page">
			<PageContextMenu title={'User Profile'} breadcrumb={breadcrumb} />
			<button className="theme back-button" onClick={() => navigate('/users')}>
				Back
			</button>

			<section>
				<div className="info-and-actions">
					<LoadingBlocker loading={loadingUser}>
						<ul className="record">
							<li>
								<strong>ID</strong>: {user?.id}
							</li>
							<li>
								<strong>Email</strong>: {user?.email}
							</li>
							<li>
								<strong>First Name</strong>: {user?.firstName}
							</li>
							<li>
								<strong>Last Name</strong>: {user?.lastName}
							</li>
							<li>
								<strong>Created At</strong>: {formatDate(user?.createdAt)}
							</li>
							<li>
								<strong>Modified At</strong>: {formatDate(user?.modifiedAt)}
							</li>
							<li>
								<strong>Email Verified</strong>: {formatYesNo(user?.emailVerfied)}
							</li>
							<li>
								<strong>Admin Level</strong>: {user?.adminLevel}
							</li>
							<li>
								<strong>Default LLM</strong>: {userPreferences?.defaultLlm}
							</li>
						</ul>
					</LoadingBlocker>
					<div className="actions">
						<h3>Actions</h3>
x
					</div>
				</div>
			</section>

			<TabPanel tabs={['Account', 'Preferences']}>
				<TabPanelPanel tabName="Account">
					<LoadingBlocker loading={loadingUser}>
						<UserAccountForm
							user={user}
							handleUpdate={handleAccountUpdate}
							handleDelete={handleAccountDelete}
						/>
					</LoadingBlocker>
				</TabPanelPanel>
				<TabPanelPanel tabName="Preferences">
					<LoadingBlocker loading={loadingUserPreferences}>
						<UserPreferencesForm
							userPreferences={userPreferences}
							handleUpdate={handlePreferencesUpdate}
						/>
					</LoadingBlocker>
				</TabPanelPanel>
			</TabPanel>
		</div>
	)
}

export default User
