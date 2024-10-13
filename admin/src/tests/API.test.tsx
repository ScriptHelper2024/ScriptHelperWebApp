import React from 'react'
import { render, screen, act } from '@testing-library/react'
import UseApiTestComponent from './util/UseApiTestComponent'
import localStorageMock from './util/localStorageMock'

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

test('tests Login and Logout', async () => {
	expect(process.env.REACT_APP_GRAPHQL_SERVER_URI).not.toBe(undefined)
	async function doLogin(api) {
		return api.doLogin('test@example.com', 'password').then((data) => {
			expect(data?.token).not.toBe(undefined)
			expect(api.isAuthenticated()).toBe(true)
		})
	}

	const { rerender } = render(<UseApiTestComponent fn={doLogin} />)
	let textElement = screen.getByText(/test/i)
	expect(textElement).toBeInTheDocument()

	await act(() => {
		async function doLogout(api) {
			api.doLogout()
			expect(api.isAuthenticated()).toBe(false)
		}

		rerender(<UseApiTestComponent fn={doLogout} />)
		textElement = screen.getByText(/test/i)
		expect(textElement).toBeInTheDocument()
	})
}, 10000)
