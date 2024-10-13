import React from 'react'
import PropTypes from 'prop-types'
import './EditPromptTemplatesModal.scss'

import ModalDialog from '../ModalDialog/ModalDialog'
import { FeedbackContext } from '../../contexts/FeedbackContext/FeedbackContext'
import useApi from '../../api/useApi'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import FormikErrorMessageHelper from '../../util/FormikErorMessageHelper'
import LoadingBlocker from '../LoadingBlocker/LoadingBlocker'
import formikModalOnClose from '../../tests/util/formikModalOnClose'

const EditPromptTemplatesModal = ({ isOpen, onFinished, recordId }) => {
	const [loading, setLoading] = React.useState(false)
	const [record, setRecord] = React.useState(null)

	const feedbackContext = React.useContext(FeedbackContext)
	const api = useApi()

	React.useEffect(() => {
		if (recordId) {
			setLoading(true)
			api
				.getPromptTemplate(recordId)
				.then((data) => setRecord(data.promptTemplate))
				.catch((e) => feedbackContext.handleException(e))
				.finally(() => setLoading(false))
		}
	}, [recordId])

	const formik = useFormik({
		initialValues: {
			name: record?.name || '',
			promptText: record?.promptText || '',
			referenceKey: record?.referenceKey || '',
		},
		enableReinitialize: true,
		validationSchema: Yup.object({
			name: Yup.string().label('Name').required(),
			referenceKey: Yup.string().label('Reference Key').required(),
			promptText: Yup.string().label('Prompt Text').required(),
		}),
		onSubmit: async (values, { setFieldError }) => {
			feedbackContext.clear()
			setLoading(true)
			if (record?.id) {
				return await api
					.updatePromptTemplate({ id: record.id, ...values })
					.then((data) => {
						setRecord(data.record)
						feedbackContext.indicateSuccess(
							'Prompt Template updated:' + data.record.referenceKey
						)
						onFinished(true)
					})
					.catch((e) => {
						if (e?.graphQLErrors) {
							const helper = new FormikErrorMessageHelper(setFieldError, {})
							if (!helper.handleAll(e?.graphQLErrors)) {
								helper.unhandled.forEach((error) => {
									feedbackContext.handleException(error)
								})
							}
						} else {
							throw e
						}
					})
					.finally(() => {
						setLoading(false)
					})
			} else {
				return await api
					.addPromptTemplate(values)
					.then((data) => {
						setRecord(data.record)
						feedbackContext.indicateSuccess(
							'Prompt Template created: ' + data.record.referenceKey,
							{ attributes: { 'data-record-id': data.record.id } }
						)
						onFinished(true)
					})
					.catch((e) => {
						if (e?.graphQLErrors && e.graphQLErrors.length !== 0) {
							const helper = new FormikErrorMessageHelper(setFieldError, {})
							if (!helper.handleAll(e?.graphQLErrors)) {
								helper.unhandled.forEach((error) => {
									feedbackContext.handleException(error)
								})
							}
						} else {
							feedbackContext.handleException(e)
						}
					})
					.finally(() => setLoading(false))
			}
		},
	})

	const handleDelete = () => {
		if (
			confirm(
				'Are you sure you want to delete this Prompt Template?\n\nNote: This action cannot be undone.'
			)
		) {
			setLoading(true)
			api
				.deletePromptTemplate(record.id)
				.then(() => {
					feedbackContext.indicateSuccess(
						'Prompt Template deleted: ' + record.referenceKey
					)
					onFinished(true)
				})
				.catch((e) => feedbackContext.handleException(e))
				.finally(() => setLoading(false))
		}
	}

	const formRef = React.useRef(null)

	const onClose = formikModalOnClose(formik, formRef, onFinished)

	return (
		<ModalDialog
			isOpen={isOpen}
			className="EditPromptTemplatesModal"
			onClose={onClose}
		>
			<LoadingBlocker loading={loading}>
				<form onSubmit={formik.handleSubmit} className="record" ref={formRef}>
					<h3>{recordId ? 'Edit' : 'Add'} Prompt Template Entry</h3>
					{/* Display assigned settings if any */}
					{record?.assignedSettings && record.assignedSettings.length > 0 && (
							<div className="field">
									<label>
											<span>Assigned Settings</span>
											<ul>
													{record.assignedSettings.map((setting, index) => (
															<li key={index}>{setting}</li>
													))}
											</ul>
									</label>
							</div>
					)}
										
					<div className="field">
						<label>
							<span>Name</span>
							<input
								type="text"
								name="name"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.name}
							/>
						</label>
						<div className="error">{formik.touched.name && formik.errors.name}</div>
					</div>
					<div className="field">
						<label>
							<span>Reference Key</span>
							<input
								type="text"
								name="referenceKey"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.referenceKey}
							/>
						</label>
						<div className="error">
							{formik.touched.referenceKey && formik.errors.referenceKey}
						</div>
					</div>
					<div className="field">
						<label>
							<span>Prompt Text</span>
							<textarea
								name="promptText"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.promptText}
							/>
						</label>
						<div className="error">
							{formik.touched.promptText && formik.errors.promptText}
						</div>
					</div>

					<div className="actions">
						<button
							type="submit"
							className="theme"
							aria-label="Update Record"
							disabled={!formik.dirty || !formik.isValid}
						>
							Update
						</button>
						{record?.id && (
							<button
								type="button"
								className="theme danger"
								aria-label="Delete Record"
								onClick={() => handleDelete(record.id)}
							>
								Delete
							</button>
						)}
						<button
							type="button"
							className="theme plain"
							aria-label="Cancel Edit"
							onClick={() => onFinished(false)}
						>
							Cancel
						</button>
					</div>
				</form>
			</LoadingBlocker>
		</ModalDialog>
	)
}

EditPromptTemplatesModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onFinished: PropTypes.func.isRequired,
	recordId: PropTypes.string,
}

export default EditPromptTemplatesModal
