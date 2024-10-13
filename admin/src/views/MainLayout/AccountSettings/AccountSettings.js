import React from 'react'
import './AccountSettings.scss'

import useApi from '../../../api/useApi'
import { FeedbackContext } from '../../../contexts/FeedbackContext/FeedbackContext'
import LoadingBlocker from '../../../components/LoadingBlocker/LoadingBlocker'
import PageContextMenu from '../../../components/PageContextMenu/PageContextMenu'
import usePageTitle from '../../../hooks/usePageTitle'
import TabPanel, { TabPanelPanel } from '../../../components/TabPanel/TabPanel'
import UserAccountForm from '../../../components/UserAccountForm/UserAccountForm'
import UserPreferencesForm from '../../../components/UserPreferencesForm/UserPreferencesForm'

const AccountSettings = () => {
	const [loadingUser, setLoadingUser] = React.useState(false)
	const [user, setUser] = React.useState(null)
	const [loadingUserPreferences, setLoadingUserPreferences] =
		React.useState(false)
	const [userPreferences, setUserPreferences] = React.useState(null)

	const feedbackContext = React.useContext(FeedbackContext)

	usePageTitle('Account Settings')

	const api = useApi()
	React.useEffect(() => {
		setLoadingUser(true)
		api
			.getMe()
			.then((data) => setUser(data.user))
			.catch((e) => feedbackContext.handleException(e))
			.finally(() => setLoadingUser(false))

		setLoadingUserPreferences(true)
		api
			.getMyUserPreferences()
			.then((data) => setUserPreferences(data))
			.catch((e) => feedbackContext.handleException(e))
			.finally(() => setLoadingUserPreferences(false))
	}, [])

	const handleAccountUpdate = (values) => {
		setLoadingUser(true)
		return api
			.updateMe(values.email, values.firstName, values.lastName, values.password)
			.then((data) => {
				setUser(data.user)
				feedbackContext.indicateSuccess('Account Settings updated')
			})
			.catch((e) => feedbackContext.handleException(e))
			.finally(() => setLoadingUser(false))
	}

	const handlePreferencesUpdate = (values) => {
		setLoadingUserPreferences(true)
		return api
			.updateMyUserPreferences(values)
			.then((data) => {
				setUserPreferences(data.userPreference)
				feedbackContext.indicateSuccess('User Preferences updated')
			})
			.catch((e) => feedbackContext.handleException(e))
			.finally(() => setLoadingUserPreferences(false))
	}

	return (
		<div className="AccountSettings page">
			<PageContextMenu title="Account Settings" />

			<TabPanel tabs={['Account', 'Preferences']}>
				<TabPanelPanel tabName="Account">
					<LoadingBlocker loading={loadingUser}>
						<UserAccountForm user={user} handleUpdate={handleAccountUpdate} />
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

export default AccountSettings
