import React from 'react'
import PropTypes from 'prop-types'
import './EditAuthorStylesModal.scss'

import ModalDialog from '../ModalDialog/ModalDialog'
import { FeedbackContext } from '../../contexts/FeedbackContext/FeedbackContext'
import useApi from '../../api/useApi'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import FormikErrorMessageHelper from '../../util/FormikErorMessageHelper'
import LoadingBlocker from '../LoadingBlocker/LoadingBlocker'
import formikModalOnClose from '../../tests/util/formikModalOnClose'

const EditAuthorStylesModal = ({ isOpen, onFinished, recordId }) => {
	const [loading, setLoading] = React.useState(false)
	const [record, setRecord] = React.useState(null)

	const feedbackContext = React.useContext(FeedbackContext)
	const api = useApi()

	React.useEffect(() => {
		if (recordId) {
			setLoading(true)
			api
				.getAuthorStyle(recordId)
				.then((data) => setRecord(data.authorStyle))
				.catch((e) => feedbackContext.handleException(e))
				.finally(() => setLoading(false))
		}
	}, [recordId])

	const formik = useFormik({
		initialValues: {
			archived: record?.archived || false,
			name: record?.name || '',
			promptText: record?.promptText || '',
		},
		enableReinitialize: true,
		validationSchema: Yup.object({
			name: Yup.string().label('Name').required(),
		}),
		onSubmit: async (values, { setFieldError }) => {
			feedbackContext.clear()
			setLoading(true)
			if (record?.id) {
				return await api
					.updateAuthorStyle({ id: record.id, ...values })
					.then((data) => {
						setRecord(data.record)
						feedbackContext.indicateSuccess(
							'Author Style updated:' + data.record.name
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
					.addAuthorStyle(values)
					.then((data) => {
						setRecord(data.record)
						feedbackContext.indicateSuccess(
							'Author Style created: ' + data.record.name,
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
				'Are you sure you want to delete this Author Style?\n\nNote: This action cannot be undone.'
			)
		) {
			setLoading(true)
			api
				.deleteAuthorStyle(record.id)
				.then(() => {
					feedbackContext.indicateSuccess('Author Style deleted: ' + record.name)
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
			className="EditAuthorStylesModal"
			onClose={onClose}
		>
			<LoadingBlocker loading={loading}>
				<form ref={formRef} onSubmit={formik.handleSubmit} className="record">
					<h3>{recordId ? 'Edit' : 'Add'} Author Style Entry</h3>
					<div className="field-group">
						<div className="field checkbox">
							<label>
								<span>Archived</span>
								<input
									type="checkbox"
									name="archived"
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									checked={formik.values.archived}
								/>
							</label>
							<div className="error">
								{formik.touched.archived && formik.errors.archived}
							</div>
						</div>
					</div>
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
							disabled={!formik.dirty || !formik.isValid}
							aria-label="Update Record"
						>
							Update
						</button>
						{record?.id && (
							<button
								type="button"
								className="theme danger"
								onClick={() => handleDelete(record.id)}
								aria-label="Delete Record"
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

EditAuthorStylesModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onFinished: PropTypes.func.isRequired,
	recordId: PropTypes.string,
}

export default EditAuthorStylesModal
