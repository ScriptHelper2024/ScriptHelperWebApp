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

test('tests Prompt Templates page', async () => {
	const { baseElement } = render(<App />)

	await login(baseElement)

	const homeText = screen.getByText('* TODO *')
	expect(homeText).toBeInTheDocument()

	// navigate to prompt templates page
	const promptTemplatesText = screen.getByText('Prompt Templates')
	expect(promptTemplatesText).toBeInTheDocument()

	const promptTemplatesLink = baseElement.querySelector(
		'a[href="/prompt-templates"]'
	)
	expect(promptTemplatesLink).toBeInTheDocument()
	userEvent.click(promptTemplatesLink)
	await waitForElementToBeRemoved(homeText, { timeout: 4000 })

	const promptTemplatesTitle = baseElement.querySelector('h1')
	expect(promptTemplatesTitle).toBeInTheDocument()
	expect(getElementText(promptTemplatesTitle)).toBe('Prompt Templates')

	// test prompt templates page
	const addPromptTemplatesButton = screen.getByText('Add Prompt Template')
	expect(addPromptTemplatesButton).toBeInTheDocument()
	userEvent.click(addPromptTemplatesButton)
	await new Promise((r) => setTimeout(r, 100))

	// test Prompt Templates add
	let promptTemplatesForm = baseElement.querySelector('form')
	expect(promptTemplatesForm).toBeInTheDocument()

	let nameField = promptTemplatesForm.querySelector('[name="name"]')
	let referenceKeyField = promptTemplatesForm.querySelector(
		'[name="referenceKey"]'
	)
	let promptTextField = promptTemplatesForm.querySelector('[name="promptText"]')
	let submitPromptTemplatesButton = promptTemplatesForm.querySelector(
		'button[type="submit"]'
	)

	expect(nameField).toBeInTheDocument()
	expect(referenceKeyField).toBeInTheDocument()
	expect(promptTextField).toBeInTheDocument()
	expect(submitPromptTemplatesButton).toBeInTheDocument()

	fireEvent.change(nameField, { target: { value: '[TEST DATA] Test Name' } })
	fireEvent.change(referenceKeyField, {
		target: { value: '[TEST DATA] Test Reference Key' },
	})
	fireEvent.change(promptTextField, {
		target: { value: '[TEST DATA] Test Prompt Text' },
	})
	userEvent.click(submitPromptTemplatesButton)

	await waitForElementToBeRemoved(promptTemplatesForm, { timeout: 4000 })
	await new Promise((r) => setTimeout(r, 1000))
	let successMessage = baseElement.querySelector(
		'.feedback.show.SUCCESS .message'
	)
	expect(successMessage).toBeInTheDocument()

	const recordId = successMessage.getAttribute('data-record-id')
	expect(recordId).toBeDefined()

	// test Prompt Templates update
	const recordsTable = baseElement.querySelector('.RecordsTable')
	let row = getRecordsTableRowByColumnValue(recordsTable, 'ID', recordId)

	let editRecordButton = row.querySelector('button')
	userEvent.click(editRecordButton)
	await new Promise((r) => setTimeout(r, 100))

	promptTemplatesForm = baseElement.querySelector('form')
	expect(promptTemplatesForm).toBeInTheDocument()

	nameField = promptTemplatesForm.querySelector('[name="name"]')
	referenceKeyField = promptTemplatesForm.querySelector('[name="referenceKey"]')
	promptTextField = promptTemplatesForm.querySelector('[name="promptText"]')
	submitPromptTemplatesButton = promptTemplatesForm.querySelector(
		'button[type="submit"]'
	)

	expect(nameField).toBeInTheDocument()
	expect(referenceKeyField).toBeInTheDocument()
	expect(promptTextField).toBeInTheDocument()
	expect(submitPromptTemplatesButton).toBeInTheDocument()

	fireEvent.change(nameField, {
		target: { value: '[TEST DATA] Test Name updated' },
	})
	fireEvent.change(referenceKeyField, {
		target: { value: '[TEST DATA] Test Reference Key updated' },
	})
	fireEvent.change(promptTextField, {
		target: { value: '[TEST DATA] Test Prompt Text updated' },
	})
	userEvent.click(submitPromptTemplatesButton)

	await waitForElementToBeRemoved(promptTemplatesForm, { timeout: 4000 })
	await new Promise((r) => setTimeout(r, 1000))
	successMessage = baseElement.querySelector('.feedback.show.SUCCESS .message')
	expect(successMessage).toBeInTheDocument()

	// test Prompt Templates delete
	row = getRecordsTableRowByColumnValue(recordsTable, 'ID', recordId)
	editRecordButton = row.querySelector('button')
	userEvent.click(editRecordButton)
	await new Promise((r) => setTimeout(r, 100))

	promptTemplatesForm = baseElement.querySelector('form')
	expect(promptTemplatesForm).toBeInTheDocument()

	const deletePromptTemplateButton = promptTemplatesForm.querySelector(
		'button[aria-label="Delete Record"]'
	)
	expect(deletePromptTemplateButton).not.toBeNull()
	userEvent.click(deletePromptTemplateButton)

	await waitForElementToBeRemoved(promptTemplatesForm, { timeout: 4000 })
	await new Promise((r) => setTimeout(r, 1000))
	successMessage = baseElement.querySelector('.feedback.show.SUCCESS .message')
	expect(successMessage).toBeInTheDocument()
})
