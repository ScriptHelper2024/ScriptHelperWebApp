import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { UserContextProvider } from '../../contexts/UserContext'
import useApi from '../../api/useApi'

const ProtectedRoute = () => {
	const api = useApi()

	let location = useLocation()

	return api.isAuthenticated() ? (
		<UserContextProvider>
			<Outlet />
		</UserContextProvider>
	) : (
		<Navigate to="/login" state={{ from: location }} replace />
	)
}

export default ProtectedRoute
