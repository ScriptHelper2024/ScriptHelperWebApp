import React from 'react'
import PropTypes from 'prop-types'
import './EditMagicNotesDialog.scss'

import ModalDialog from '../ModalDialog/ModalDialog'
import { FeedbackContext } from '../../contexts/FeedbackContext/FeedbackContext'
import useApi from '../../api/useApi'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import FormikErrorMessageHelper from '../../util/FormikErorMessageHelper'
import LoadingBlocker from '../LoadingBlocker/LoadingBlocker'
import formikModalOnClose from '../../tests/util/formikModalOnClose'

const EditMagicNotesDialog = ({ isOpen, onFinished, recordId }) => {
	const [loading, setLoading] = React.useState(false)
	const [record, setRecord] = React.useState(null)

	const feedbackContext = React.useContext(FeedbackContext)
	const api = useApi()

	React.useEffect(() => {
		if (recordId) {
			setLoading(true)
			api
				.getMagicNote(recordId)
				.then((data) => {
					setRecord(data.magicNote)
				})
				.catch((e) => feedbackContext.handleException(e))
				.finally(() => setLoading(false))
		}
	}, [recordId])

	const formik = useFormik({
		initialValues: {
			active: record?.id ? !!record?.active : true,
			name: record?.name || '',
			orderRank:
				record?.orderRank || record?.orderRank === 0
					? Number(record?.orderRank) ?? ''
					: '',
			storyTextPrompt: record?.storyTextPrompt || '',
			sceneTextPrompt: record?.sceneTextPrompt || '',
			beatSheetPrompt: record?.beatSheetPrompt || '',
			scriptTextPrompt: record?.scriptTextPrompt || '',
		},
		enableReinitialize: true,
		validationSchema: Yup.object({
			active: Yup.boolean().label('Active').required(),
			name: Yup.string().label('Name').required(),
			orderRank: Yup.number()
				.typeError('Order Rank should be numeric')
				.label('Order Rank')
				.required(),
			storyTextPrompt: Yup.string().label('Story Text'),
			sceneTextPrompt: Yup.string().label('Scene Text'),
			beatSheetPrompt: Yup.string().label('Beat Sheet'),
			scriptTextPrompt: Yup.string().label('Script Text'),
		}),
		onSubmit: async (values, { setFieldError }) => {
			feedbackContext.clear()
			setLoading(true)
			if (record?.id) {
				return await api
					.updateMagicNote({ id: record.id, ...values })
					.then((data) => {
						setRecord(data.record)
						feedbackContext.indicateSuccess('Magic Note updated:' + data.record.id)
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
					.addMagicNote(values)
					.then((data) => {
						setRecord(data.record)
						feedbackContext.indicateSuccess('Magic Note created: ' + data.record.id, {
							attributes: { 'data-record-id': data.record.id },
						})
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
				'Are you sure you want to delete this Magic Note?\n\nNote: This action cannot be undone.'
			)
		) {
			setLoading(true)
			api
				.deleteMagicNote(record.id)
				.then(() => {
					feedbackContext.indicateSuccess('Magic Note deleted: ' + record.id)
					onFinished(true)
				})
				.catch((e) => feedbackContext.handleException(e))
				.finally(() => setLoading(false))
		}
	}

	const formRef = React.useRef(null)

	const onClose = formikModalOnClose(formik, formRef, onFinished)

	return (
		<ModalDialog isOpen={isOpen} className="EditMagicNoteModal" onClose={onClose}>
			<LoadingBlocker loading={loading}>
				<form onSubmit={formik.handleSubmit} className="record" ref={formRef}>
					<h3>{recordId ? 'Edit' : 'Add'} Magic Note</h3>
					<div className="field checkbox">
						<label>
							<span>Active</span>
							<input
								type="checkbox"
								name="active"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								checked={formik.values.active}
							/>
						</label>
						<div className="error">
							{formik.touched.active && formik.errors.active}
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
							<span>Order Rank</span>
							<input
								type="text"
								name="orderRank"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.orderRank}
							/>
						</label>
						<div className="error">
							{formik.touched.orderRank && formik.errors.orderRank}
						</div>
					</div>
					<div className="field">
						<label>
							<span>Story Text</span>
							<textarea
								name="storyTextPrompt"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.storyTextPrompt}
							/>
						</label>
						<div className="error">
							{formik.touched.storyTextPrompt && formik.errors.storyTextPrompt}
						</div>
					</div>
					<div className="field">
						<label>
							<span>Scene Text</span>
							<textarea
								name="sceneTextPrompt"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.sceneTextPrompt}
							/>
						</label>
						<div className="error">
							{formik.touched.sceneTextPrompt && formik.errors.sceneTextPrompt}
						</div>
					</div>
					<div className="field">
						<label>
							<span>Beat Sheet</span>
							<textarea
								name="beatSheetPrompt"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.beatSheetPrompt}
							/>
						</label>
						<div className="error">
							{formik.touched.beatSheetPrompt && formik.errors.beatSheetPrompt}
						</div>
					</div>
					<div className="field">
						<label>
							<span>Script Text</span>
							<textarea
								name="scriptTextPrompt"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.scriptTextPrompt}
							/>
						</label>
						<div className="error">
							{formik.touched.scriptTextPrompt && formik.errors.scriptTextPrompt}
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

EditMagicNotesDialog.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onFinished: PropTypes.func.isRequired,
	recordId: PropTypes.string,
}

export default EditMagicNotesDialog
