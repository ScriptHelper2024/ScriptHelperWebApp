import React from 'react'
import PropTypes from 'prop-types'
import useDebouncingState from '../../hooks/useDebouncingState'
import ClearableInput from '../ClearableInput/ClearableInput'

const SearchInput = ({
	value: originalValue,
	onChange: originalOnChange,
	...rest
}) => {
	const [value, setValue] = useDebouncingState(originalValue, (value) => {
		// simulate a browser change event
		const e = { target: { value } }
		originalOnChange(e)
	})

	const onChange = (e) => {
		setValue(e.target.value)
	}

	return <ClearableInput value={value} onChange={onChange} {...rest} />
}

SearchInput.propTypes = {
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
}

export default SearchInput
