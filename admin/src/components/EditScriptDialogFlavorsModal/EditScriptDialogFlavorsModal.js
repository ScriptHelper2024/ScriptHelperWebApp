import React from 'react'
import PropTypes from 'prop-types'
import './EditScriptDialogFlavorsModal.scss'
import ModalDialog from '../ModalDialog/ModalDialog'
import { FeedbackContext } from '../../contexts/FeedbackContext/FeedbackContext'
import useApi from '../../api/useApi'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import FormikErrorMessageHelper from '../../util/FormikErorMessageHelper'
import LoadingBlocker from '../LoadingBlocker/LoadingBlocker'
import formikModalOnClose from '../../tests/util/formikModalOnClose'

const EditScriptDialogFlavorsModal = ({ isOpen, onFinished, recordId }) => {
	const [loading, setLoading] = React.useState(false)
	const [record, setRecord] = React.useState(null)

	const feedbackContext = React.useContext(FeedbackContext)
	const api = useApi()

	React.useEffect(() => {
		if (recordId) {
			setLoading(true)
			api
				.getScriptDialogFlavor(recordId)
				.then((data) => setRecord(data.scriptDialogFlavor))
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
					.updateScriptDialogFlavor({ id: record.id, ...values })
					.then((data) => {
						setRecord(data.record)
						feedbackContext.indicateSuccess(
							'Script Dialog Flavor updated:' + data?.record?.name
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
					.addScriptDialogFlavor(values)
					.then((data) => {
						setRecord(data.record)
						feedbackContext.indicateSuccess(
							'Script Dialog Flavor created: ' + data.record.name,
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
				'Are you sure you want to delete this Script Dialog Flavor?\n\nNote: This action cannot be undone.'
			)
		) {
			setLoading(true)
			api
				.deleteScriptDialogFlavor(record.id)
				.then(() => {
					feedbackContext.indicateSuccess('Script Dialog Flavor deleted.')
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
			className="EditScriptDialogFlavorsModal"
			onClose={onClose}
		>
			<LoadingBlocker loading={loading}>
				<form onSubmit={formik.handleSubmit} className="record" ref={formRef}>
					<h3>{recordId ? 'Edit' : 'Add'} Script Dialog Flavor Entry</h3>
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

EditScriptDialogFlavorsModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onFinished: PropTypes.func.isRequired,
	recordId: PropTypes.string,
}

export default EditScriptDialogFlavorsModal
