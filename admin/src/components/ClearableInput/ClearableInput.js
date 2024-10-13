import React from 'react'
import PropTypes from 'prop-types'
import './ClearableInput.scss'

const ClearableInput = ({ buttonTabIndex = -1, ...rest }) => {
	const inputRef = React.useRef(null)

	function setNativeValue(element, value) {
		const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set
		const prototype = Object.getPrototypeOf(element)
		const prototypeValueSetter = Object.getOwnPropertyDescriptor(
			prototype,
			'value'
		).set

		if (valueSetter && valueSetter !== prototypeValueSetter) {
			prototypeValueSetter.call(element, value)
		} else {
			valueSetter.call(element, value)
		}
	}

	const clearInput = () => {
		setNativeValue(inputRef.current, '')
		inputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
	}

	return (
		<span className="ClearableInput">
			<input ref={inputRef} {...rest} />
			{inputRef?.current?.value !== '' && (
				<button
					tabIndex={buttonTabIndex}
					type="button"
					onClick={clearInput}
				></button>
			)}
		</span>
	)
}

ClearableInput.propTypes = {
	buttonTabIndex: PropTypes.number,
}

export default ClearableInput
