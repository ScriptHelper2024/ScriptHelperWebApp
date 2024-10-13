import React from 'react'
import getElementText from './util/getElementText'
import getRecordsTableRowByColumnValue from './util/getRecordsTableRowByColumnValue'
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
Object.defineProperty(window, 'confirm', { value: () => true })

const originalWarn = console.error.bind(console.error)
beforeAll(() => {
	console.error = (msg) => {
		if (
			msg
				.toString()
				.includes('An update to %s inside a test was not wrapped in act')
		) {
			return false
		}
		return msg
	}
})
afterAll(() => {
	console.error = originalWarn
})

test('tests Script Dialog Flavors page', async () => {
	const { baseElement } = render(<App />)

	await login(baseElement)

	const homeText = screen.getByText('* TODO *')
	expect(homeText).toBeInTheDocument()

	// navigate to Script Dialog Flavors page
	const pageLink = baseElement.querySelector('a[href="/script-dialog-flavors"]')
	expect(pageLink).toBeInTheDocument()
	userEvent.click(pageLink)
	await waitForElementToBeRemoved(homeText, { timeout: 4000 })

	const pageTitle = baseElement.querySelector('h1')
	expect(pageTitle).toBeInTheDocument()
	expect(getElementText(pageTitle)).toBe('Script Dialog Flavors')

	// set the filter to show archived records
	const includeArchived = screen.getByLabelText('Include Archived')
	userEvent.click(includeArchived)

	// test Script Dialog Flavors page
	const addRecordButton = screen.getByText('Add Script Dialog Flavor')
	expect(addRecordButton).toBeInTheDocument()
	userEvent.click(addRecordButton)
	await new Promise((r) => setTimeout(r, 100))

	// test Script Dialog Flavors add
	let recordForm = baseElement.querySelector('form')
	expect(recordForm).toBeInTheDocument()

	let nameField = recordForm.querySelector('[name="name"]')
	let archivedField = recordForm.querySelector('[name="archived"]')
	let promptTextField = recordForm.querySelector('[name="promptText"]')
	let submitFormButton = recordForm.querySelector('button[type="submit"]')

	expect(nameField).toBeInTheDocument()
	expect(archivedField).toBeInTheDocument()
	expect(promptTextField).toBeInTheDocument()
	expect(submitFormButton).toBeInTheDocument()

	fireEvent.change(nameField, { target: { value: '[TEST DATA] Test Name' } })
	fireEvent.click(archivedField)
	fireEvent.change(promptTextField, {
		target: { value: '[TEST DATA] Test Prompt Text' },
	})
	userEvent.click(submitFormButton)

	await waitForElementToBeRemoved(submitFormButton, { timeout: 4000 })
	await new Promise((r) => setTimeout(r, 1000))
	let successMessage = baseElement.querySelector(
		'.feedback.show.SUCCESS .message'
	)
	expect(successMessage).toBeInTheDocument()

	const recordId = successMessage.getAttribute('data-record-id')
	expect(recordId).toBeDefined()

	// test Script Dialog Flavors update
	const recordsTable = baseElement.querySelector('.RecordsTable')
	let row = getRecordsTableRowByColumnValue(recordsTable, 'ID', recordId)

	let editRecordButton = row.querySelector('button')
	userEvent.click(editRecordButton)
	await new Promise((r) => setTimeout(r, 100))

	recordForm = baseElement.querySelector('form')
	expect(recordForm).toBeInTheDocument()

	nameField = recordForm.querySelector('[name="name"]')
	archivedField = recordForm.querySelector('[name="archived"]')
	promptTextField = recordForm.querySelector('[name="promptText"]')
	submitFormButton = recordForm.querySelector('button[type="submit"]')

	expect(nameField).toBeInTheDocument()

	expect(archivedField).toBeInTheDocument()
	expect(promptTextField).toBeInTheDocument()
	expect(submitFormButton).toBeInTheDocument()

	fireEvent.change(nameField, {
		target: { value: '[TEST DATA] Test Name updated' },
	})
	fireEvent.click(archivedField)
	fireEvent.change(promptTextField, {
		target: { value: '[TEST DATA] Test Prompt Text updated' },
	})
	userEvent.click(submitFormButton)

	await waitForElementToBeRemoved(recordForm, { timeout: 4000 })
	await new Promise((r) => setTimeout(r, 1000))
	successMessage = baseElement.querySelector('.feedback.show.SUCCESS .message')
	expect(successMessage).toBeInTheDocument()

	// test Script Dialog Flavors delete
	row = getRecordsTableRowByColumnValue(recordsTable, 'ID', recordId)
	editRecordButton = row.querySelector('button')
	userEvent.click(editRecordButton)
	await new Promise((r) => setTimeout(r, 100))

	recordForm = baseElement.querySelector('form')
	expect(recordForm).toBeInTheDocument()

	const deleteRecordButton = recordForm.querySelector(
		'button[aria-label="Delete Record"]'
	)
	expect(deleteRecordButton).not.toBeNull()
	userEvent.click(deleteRecordButton)

	await waitForElementToBeRemoved(recordForm, { timeout: 4000 })
	await new Promise((r) => setTimeout(r, 1000))
	successMessage = baseElement.querySelector('.feedback.show.SUCCESS .message')
	expect(successMessage).toBeInTheDocument()
})
