import React, { useState, useEffect } from 'react'
import './GraphQLAPIExplorer.scss'
import { FaRedo, FaCopy } from 'react-icons/fa'
import { FaCheck } from 'react-icons/fa6'
import predefinedQueries from './predefinedQueries.json'
import LoadingBlocker from '../components/LoadingBlocker/LoadingBlocker'
import PageContextMenu from '../components/PageContextMenu/PageContextMenu'
import useApi from '../api/useApi'

// eslint-disable-next-line no-undef
const API_ENDPOINT = process.env.REACT_APP_GRAPHQL_SERVER_URI

export default function GraphQLAPIExplorer() {
	const api = useApi()

	const [query, setQuery] = useState('')
	const [variables] = useState({})
	const [response, setResponse] = useState(null)
	const [selectedQuery, setSelectedQuery] = useState('[Custom]')
	const [authToken, setAuthToken] = useState(api.getAuthToken() || '')
	const [includeAuth, setIncludeAuth] = useState(
		localStorage.getItem('includeAuth') === 'true'
	)
	const apiEndpoint = API_ENDPOINT
	const [requestStatus, setRequestStatus] = useState({})
	const [loading, setLoading] = useState(false) // State for tracking loading status
	const [notepadContent, setNotepadContent] = useState(
		localStorage.getItem('notepadContent') || ''
	)

	// Save notepad content to local storage whenever it changes
	useEffect(() => {
		localStorage.setItem('notepadContent', notepadContent)
	}, [notepadContent])

	useEffect(() => {
		// Save authToken to local storage whenever it changes
		localStorage.setItem('authToken', authToken)
	}, [authToken])

	useEffect(() => {
		// Save includeAuth to local storage whenever it changes
		localStorage.setItem('includeAuth', includeAuth)
	}, [includeAuth])

	useEffect(() => {
		if (selectedQuery !== '[Custom]' && predefinedQueries[selectedQuery]) {
			setQuery(generateQuery(predefinedQueries[selectedQuery]))
		} else {
			setQuery('')
		}
	}, [selectedQuery])

	// Function to reset the response data and request status
	const handleResetResponse = () => {
		setResponse(null)
		setRequestStatus({})
	}

	// Function to reset GraphQL input to the default for the selected method
	const handleResetQueryInput = () => {
		const defaultQuery =
			selectedQuery !== '[Custom]'
				? generateQuery(predefinedQueries[selectedQuery])
				: ''
		setQuery(defaultQuery)
	}

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text).then(
			() => {
				// Handle successful copy to clipboard if needed
			},
			() => {
				// Handle error case
			}
		)
	}

	const handleCopyQuery = () => {
		copyToClipboard(query)
	}

	const handleCopyResponse = () => {
		copyToClipboard(JSON.stringify(response, null, 2))
	}

	/*
  const handleNotepadChange = (e) => {
    setNotepadContent(e.target.value);
  };
  */

	const generateQuery = (definition) => {
		const { type, fields } = definition
		const operationName = Object.keys(fields)[0]

		const args = fields[operationName].args || {} // Ensure args is an object before calling Object.entries
		const returns = fields[operationName].returns || [] // Ensure returns is an array before calling map

		// Format arguments with newlines if there's more than one
		const argsContent = Object.entries(args).map(
			([key, value]) => `  ${key}: ${JSON.stringify(value)}`
		)
		const argsString =
			argsContent.length > 1
				? `(\n${argsContent.join(',\n')}\n)`
				: argsContent.length === 1
				? `(${argsContent[0]})`
				: ''

		const returnsString = formatFields(returns).join('\n')

		return `${type} {\n  ${operationName}${argsString} {\n${returnsString}\n  }\n}`
	}

	const formatFields = (fields) => {
		if (!Array.isArray(fields)) {
			return [] // Return an empty array if fields is not an array
		}
		return fields.map((field) => {
			if (typeof field === 'string') {
				return `    ${field}`
			} else if (typeof field === 'object') {
				const key = Object.keys(field)[0]
				return `    ${key} {\n${formatFields(field[key]).join('\n')}\n    }`
			}
			return '' // Return an empty string for unrecognized types
		})
	}

	const handleExecute = () => {
		setLoading(true) // Start loading

		const headers = { 'Content-Type': 'application/json' }
		if (includeAuth) {
			headers['Authorization'] = `Bearer ${authToken}`
		}

		const requestBody = {
			query: query,
			variables: variables,
		}

		setRequestStatus({ ...requestStatus, status: 'Sending...' })

		fetch(apiEndpoint, {
			method: 'POST',
			headers: headers,
			body: JSON.stringify(requestBody),
		})
			.then((res) => {
				setLoading(false) // Stop loading when we get a response
				const duration = performance.now() - startTime
				setRequestStatus({
					timestamp: new Date().toISOString(),
					methodName: selectedQuery,
					statusCode: res.status,
					responseTime: duration.toFixed(2),
				})
				return res.json()
			})
			.then((data) => setResponse(data))
			.catch((error) => {
				setLoading(false) // Stop loading if there's an error
				setResponse(error)
			})

		const startTime = performance.now()
	}

	// Checkbox input's onChange updated handler
	const handleAuthToggleChange = (e) => {
		const isChecked = e.target.checked
		setIncludeAuth(isChecked)
		if (!isChecked) {
			// Do not clear the authToken if we're just toggling the includeAuth state
			localStorage.setItem('includeAuth', isChecked)
		}
	}

	const handleKeyDown = (e) => {
		if (e.key === 'Tab' && !e.shiftKey) {
			e.preventDefault()
			const { selectionStart, selectionEnd, value } = e.target

			// Determine which textarea is the target and set the appropriate state
			const newValue =
				value.substring(0, selectionStart) + '\t' + value.substring(selectionEnd)
			if (e.target.id === 'notepad') {
				setNotepadContent(newValue)
			} else {
				// Assuming the other textarea has an id of "graphqlQuery"
				setQuery(newValue)
			}

			// Update cursor position
			e.target.selectionStart = e.target.selectionEnd = selectionStart + 1
		} else if (e.key === 'Enter') {
			e.preventDefault()
			const { selectionStart, value } = e.target

			// Find the indentation
			let startPos = selectionStart
			while (startPos > 0 && value[startPos - 1] !== '\n') {
				startPos -= 1
			}

			let indent = ''
			while (value[startPos] === ' ' || value[startPos] === '\t') {
				indent += value[startPos]
				startPos += 1
			}

			const newValue =
				value.substring(0, selectionStart) +
				'\n' +
				indent +
				value.substring(selectionStart)
			if (e.target.id === 'notepad') {
				setNotepadContent(newValue)
			} else {
				setQuery(newValue)
			}

			setTimeout(() => {
				e.target.selectionStart = e.target.selectionEnd =
					selectionStart + indent.length + 1
			}, 0)
		}
	}
	return (
		<div className="page">
			<PageContextMenu title="GraphQL API Explorer" />

			<section>
				<LoadingBlocker loading={loading}>
					<div className="mb-4 flex items-baseline gap-4">
						<div className="grow">
							<select
								id="methodSelect"
								className="theme-background text-white border border-gray-600 block w-full py-2 px-3"
								value={selectedQuery}
								onChange={(e) => setSelectedQuery(e.target.value)}
							>
								<option>[Select Method]</option>
								{Object.keys(predefinedQueries)
									.sort()
									.map((queryName) => (
										<option key={queryName} value={queryName}>
											{queryName}
										</option>
									))}
							</select>
						</div>
						<div>
							<div className="flex items-center">
								<label htmlFor="authToggle" className="font-bold">
									<input
										id="authToggle"
										type="checkbox"
										className="mr-2"
										checked={includeAuth}
										onChange={handleAuthToggleChange}
									/>
									<span>Auth</span>
								</label>
							</div>
						</div>
						<div>
							<button
								className="theme"
								onClick={handleExecute}
								disabled={loading} // Disable the button while loading
							>
								Go
							</button>
						</div>
					</div>
				</LoadingBlocker>

				{includeAuth && (
					<div className="mb-4">
						<label className="mb-1 font-bold" htmlFor="authToken">
							Authorization Token:
						</label>
						<button
							className="theme !py-0 leading-tight ml-2"
							onClick={() => setAuthToken(api.getAuthToken())}
							title="Use the authorization token for the currently logged in user (you)"
						>
							Use Mine
							{authToken === api.getAuthToken() ? (
								<FaCheck className="inline ml-1" />
							) : (
								''
							)}
						</button>
						<input
							id="authToken"
							type="text"
							className="block w-full theme-background border border-gray-600 text-white py-2 px-3 leading-tight focus:outline-none"
							value={authToken}
							onChange={(e) => setAuthToken(e.target.value)}
							placeholder="Enter token here"
						/>
					</div>
				)}
				<div className="status-box mb-4 text-sm">
					{requestStatus.timestamp && (
						<div className="flex justify-between items-center p-2 rounded">
							<span className="mr-2">
								Request sent at: <strong>{requestStatus.timestamp}</strong>
							</span>
							<span className="mr-2">
								Method: <strong>{requestStatus.methodName}</strong>
							</span>
							<span className="mr-2">
								Status: <strong>{requestStatus.statusCode}</strong>
							</span>
							<span>
								Time: <strong>{requestStatus.responseTime} ms</strong>
							</span>
						</div>
					)}
				</div>
				<div className="flex gap-4">
					<div className="flex flex-col w-1/2 relative">
						<div className="absolute left-0 flex">
							<button
								className="text-lg p-2 mb-2"
								onClick={handleResetQueryInput}
								title="Reset GraphQL Input"
							>
								<FaRedo />
							</button>
							<button
								className="text-lg p-2 mb-2"
								onClick={handleCopyQuery}
								title="Copy GraphQL Input"
							>
								<FaCopy />
							</button>
						</div>
						<textarea
							id="graphqlQuery"
							className="h-600px resize-none p-2 border rounded bg-gray-700 text-white mt-11"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Enter your GraphQL query or mutation here"
						/>
					</div>
					<div className="flex flex-col w-1/2">
						<div className="self-end flex">
							<button
								className="text-lg p-2 mb-2"
								onClick={handleResetResponse}
								title="Clear API Response"
							>
								<FaRedo />
							</button>
							<button
								className="text-lg p-2 mb-2"
								onClick={handleCopyResponse}
								title="Copy API Response"
							>
								<FaCopy />
							</button>
						</div>
						<textarea
							className="h-600px resize-none p-2 border rounded bg-gray-700 text-white"
							readOnly
							value={JSON.stringify(response, null, 2)}
							placeholder="The response will be displayed here"
						/>
					</div>
				</div>
				<div className="container mt-8 mx-auto">
					<label className="block font-bold mb-2" htmlFor="notepad">
						Notepad
					</label>
					<textarea
						id="notepad"
						className="w-full h-600px resize-none p-2 border rounded bg-gray-700 text-white"
						value={notepadContent}
						onChange={(e) => setNotepadContent(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Type your notes here..."
					/>
				</div>
			</section>
		</div>
	)
}
