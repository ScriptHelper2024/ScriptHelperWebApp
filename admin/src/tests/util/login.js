import {
	screen,
	fireEvent,
	waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

async function login(baseElement) {
	const username = screen.getByLabelText('Username')
	expect(username).toBeInTheDocument()

	const password = screen.getByLabelText('Password')
	expect(password).toBeInTheDocument()

	const submit = baseElement.querySelector("button[type='submit']")
	expect(submit).toBeInTheDocument()
	fireEvent.change(username, { target: { value: 'admin@example.com' } })
	fireEvent.change(password, { target: { value: 'password' } })
	userEvent.click(submit)

	return await waitForElementToBeRemoved(submit, { timeout: 2000 })
}

export default login
