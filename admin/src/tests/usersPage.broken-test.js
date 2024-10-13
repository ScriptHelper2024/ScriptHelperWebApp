import React from 'react'
import {
	render,
	screen,
	fireEvent,
	waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import localStorageMock from './util/localStorageMock'
import App from '../App'

import login from './util/login'

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

const originalWarn = console.error.bind(console.error)
beforeAll(() => {
	console.error = (msg, replace) => {
		return (
			!(
				['RouterProvider', 'Login'].includes(replace) &&
				msg
					.toString()
					.includes('An update to %s inside a test was not wrapped in act')
			) && originalWarn(msg)
		)
	}
})
afterAll(() => {
	console.error = originalWarn
})

test('tests Users page', async () => {
	const { baseElement } = render(<App />)

	await login(baseElement)

	const homeText = screen.getByText('* TODO *')
	expect(homeText).toBeInTheDocument()

	const usersLink = baseElement.querySelector('a[href="/users"]')
	expect(usersLink).toBeInTheDocument()
	userEvent.click(usersLink)

	await waitForElementToBeRemoved(homeText, { timeout: 4000 })
	const usersTitle = baseElement.querySelector('h1')
	expect(usersTitle).toBeInTheDocument()
	expect(usersTitle.innerHTML).toBe('Users')
})
