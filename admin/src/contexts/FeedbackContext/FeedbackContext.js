import React from 'react'
import PropTypes from 'prop-types'
import './FeedbackContext.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindowClose } from '@fortawesome/free-solid-svg-icons'

export const FeedbackContext = React.createContext()

const apolloErrorText = {
	'Invalid credentials': 'Invalid username or password',
}

const FeedbackType = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',
}

export const FeedbackContextProvider = ({ children }) => {
	const [text, setText] = React.useState('')
	const [show, setShow] = React.useState(false)
	const [type, setType] = React.useState(null)
	const [attributes, setAttributes] = React.useState(null)
	const [fadeOut, setFadeOut] = React.useState(false)
	const [fadeTimeout, setFadeTimeout] = React.useState(null)

	const getErrorText = (exception) => {
		if (exception.constructor?.name === 'ApolloError') {
			return apolloErrorText[exception.message] || exception.message || exception
		}
		return exception.message || exception
	}

	const clear = () => {
		setShow(false)
	}

	const clearPreviousFeedback = (callback) => {
		let ms = 0
		if (show) {
			ms = 400
			setShow(false)
		}
		if (ms) {
			setTimeout(() => {
				callback()
			}, ms)
		} else {
			callback()
		}
	}

	const handleException = (e) => {
		const errorText = getErrorText(e)
		if (typeof errorText === 'string') {
			raiseError(errorText)
		} else {
			throw e
		}
	}

	const raiseError = (text) => {
		clearPreviousFeedback(() => {
			setShow(true)
			setText(text)
			setType(FeedbackType.ERROR)
			setFadeOut(false)
		})
	}

	const indicateSuccess = (text, options) => {
		clearPreviousFeedback(() => {
			setShow(true)
			setText(text)
			setType(FeedbackType.SUCCESS)
			if (options?.attributes) {
				setAttributes(options?.attributes)
			}
			setFadeOut(true)
		})
	}

	const value = {
		clear,
		raiseError,
		indicateSuccess,
		getErrorText,
		handleException,
	}

	React.useEffect(() => {
		if (show && fadeOut) {
			if (fadeTimeout) {
				clearTimeout(fadeTimeout)
			}
			setFadeTimeout(
				setTimeout(() => {
					setShow(false)
				}, 7000)
			)
		}
	}, [show, fadeOut, text])

	return (
		<FeedbackContext.Provider value={value}>
			<>
				{children}
				<div className="FeedbackContext">
					<div className={`feedback ${show ? 'show' : ''} ${type}`}>
						<div className="message" {...attributes}>
							{text}
						</div>
						<button
							className="close"
							aria-label="close"
							onClick={() => setShow(false)}
						>
							<FontAwesomeIcon icon={faWindowClose} />
						</button>
					</div>
				</div>
			</>
		</FeedbackContext.Provider>
	)
}

FeedbackContextProvider.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]).isRequired,
}
