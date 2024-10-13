import React from 'react'
import PropTypes from 'prop-types'
import './DateRangePicker.scss'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const DateRangePicker = ({
	fromLabel = 'From Date',
	fromDate,
	changeFromDate,
	toLabel = 'To Date',
	toDate,
	changeToDate,
}) => {
	const handleChangeFromDate = (e) => {
		changeFromDate(e)
	}

	const handleChangeToDate = (e) => {
		changeToDate(e)
	}

	return (
		<div className="DateRangePicker">
			<div className="date-range-picker-fields">
				<DatePicker
					placeholderText={fromLabel}
					selected={fromDate}
					maxDate={toDate}
					onChange={handleChangeFromDate}
					isClearable
				/>
				<DatePicker
					placeholderText={toLabel}
					selected={toDate}
					minDate={fromDate}
					onChange={handleChangeToDate}
					isClearable
				/>
			</div>
		</div>
	)
}

DateRangePicker.propTypes = {
	fromLabel: PropTypes.string,
	fromDate: PropTypes.instanceOf(Date),
	changeFromDate: PropTypes.func.isRequired,
	toLabel: PropTypes.string,
	toDate: PropTypes.instanceOf(Date),
	changeToDate: PropTypes.func.isRequired,
}

export default DateRangePicker
