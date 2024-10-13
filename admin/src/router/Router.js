import React from 'react'
import PropTypes from 'prop-types'
import {
	Route,
	createRoutesFromElements,
	createBrowserRouter,
	RouterProvider,
} from 'react-router-dom'

import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute'
import Login from '../views/Login/Login'
import MainLayout from '../views/MainLayout/MainLayout'
import Home from '../views/MainLayout/Home/Home'
import Users from '../views/MainLayout/Users/Users'
import User from '../views/MainLayout/User/User'
import PromptTemplates from '../views/MainLayout/PromptTemplates/PromptTemplates'
import AgentTasks from '../views/MainLayout/AgentTasks/AgentTasks'
import AgentTask from '../views/MainLayout/AgentTask/AgentTask'
import AuthorStyles from '../views/MainLayout/AuthorStyles/AuthorStyles'
import StyleGuidelines from '../views/MainLayout/StyleGuidelines/StyleGuidelines'
import ScriptDialogFlavors from '../views/MainLayout/ScriptDialogFlavors/ScriptDialogFlavors'
import MagicNotes from '../views/MainLayout/MagicNotes/MagicNotes'
import AccountSettings from '../views/MainLayout/AccountSettings/AccountSettings'
import GenericErrorFallback from '../ErrorBoundary/GenericErrorFallback/GenericErrorFallback'
import QueryBrowserApp from '../graphql-api-explorer/QueryBrowserApp'
import PlatformSettings from '../views/MainLayout/PlatformSettings/PlatformSettings'

const router = createBrowserRouter(
	createRoutesFromElements(
		<>
			<Route
				path="/"
				element={<ProtectedRoute />}
				ErrorBoundary={GenericErrorFallback}
			>
				<Route path="/" element={<MainLayout />}>
					<Route index element={<Home />} />
					<Route path="users" element={<Users />} />
					<Route path="user/:userId" element={<User />} />
					<Route path="agent-tasks" element={<AgentTasks />} />
					<Route path="agent-task/:agentTaskId" element={<AgentTask />} />
					<Route path="prompt-templates" element={<PromptTemplates />} />
					<Route path="author-styles" element={<AuthorStyles />} />
					<Route path="style-guidelines" element={<StyleGuidelines />} />
					<Route path="script-dialog-flavors" element={<ScriptDialogFlavors />} />
					<Route path="magic-notes" element={<MagicNotes />} />
					<Route path="account-settings" element={<AccountSettings />} />
					<Route path="query-browser" element={<QueryBrowserApp />} />
					<Route path="platform-settings" element={<PlatformSettings />} />
				</Route>
			</Route>
			<Route path="/login" element={<Login />} />
		</>
	)
)

const Router = ({ children }) => {
	return <RouterProvider router={router}>{children}</RouterProvider>
}

Router.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]),
}

export default Router
