import React from 'react'
import PropTypes from 'prop-types'
import { useFormik } from 'formik'
import userPreferencesFields from '../../util/userPreferencesFields'
import useApi from '../../api/useApi'
import { FeedbackContext } from '../../contexts/FeedbackContext/FeedbackContext'

const UserPreferencesForm = ({ userPreferences, handleUpdate }) => {
	const [loadingDefaultLlmOptions, setLoadingDefaultLlmOptions] =
		React.useState(false)
	const [defaultLlmOptions, setDefaultLlmOptions] = React.useState(null)

	const api = useApi()
	const feedbackContext = React.useContext(FeedbackContext)

	React.useEffect(() => {
		setLoadingDefaultLlmOptions(true)
		api
			.getDefaultLlmOptions()
			.then((data) => setDefaultLlmOptions(data.defaultLlmOptions))
			.catch((e) => feedbackContext.handleException(e))
			.finally(() => setLoadingDefaultLlmOptions(false))
	}, [])

	const userPreferencesDefaultValues = {}
	for (let key in userPreferencesFields) {
		userPreferencesDefaultValues[key] = userPreferences?.[key]
	}

	const formik = useFormik({
		initialValues: userPreferencesDefaultValues,
		enableReinitialize: true,
		onSubmit: async (values, { setFieldError, resetForm }) => {
			await handleUpdate(values, setFieldError)
			resetForm()
		},
	})

	return (
		userPreferences && (
			<form onSubmit={formik.handleSubmit} className="record">
				<div className="field">
					<label>
						<span>Default LLM</span>
						<div className="value">
							{loadingDefaultLlmOptions ? (
								'Loading...'
							) : (
								<select
									name="defaultLlm"
									value={formik.values.defaultLlm}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
								>
									{Object.keys(defaultLlmOptions ?? {})?.map((key) => (
										<option key={key} value={key}>
											{defaultLlmOptions[key]}
										</option>
									))}
								</select>
							)}
						</div>
					</label>
					{formik.touched.defaultLlm && formik.errors.defaultLlm ? (
						<div className="error">{formik.errors.defaultLlm}</div>
					) : null}
				</div>
				<div className="actions">
					<button
						type="submit"
						className="theme"
						disabled={!formik.dirty || !formik.isValid}
					>
						Update
					</button>
				</div>
			</form>
		)
	)
}

UserPreferencesForm.propTypes = {
	userPreferences: PropTypes.shape({}),
	handleUpdate: PropTypes.func.isRequired,
}

export default UserPreferencesForm
