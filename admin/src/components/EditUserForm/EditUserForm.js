import React from 'react'
import PropTypes from 'prop-types'
import './EditUserForm.scss'

import LoadingBlocker from '../LoadingBlocker/LoadingBlocker'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { FeedbackContext } from '../../contexts/FeedbackContext/FeedbackContext'
import useApi from '../../api/useApi'
import FormikErrorMessageHelper from '../../util/FormikErorMessageHelper'

const EditUserForm = ({ userId, close }) => {
	const [loading, setLoading] = React.useState(false)
	const [user, setUser] = React.useState(false)

	const feedbackContext = React.useContext(FeedbackContext)
	const api = useApi()

	React.useEffect(() => {
		if (userId) {
			setLoading(true)
			api
				.getUser(userId)
				.then((data) => {
					setUser(data.user)
				})
				.catch((e) => {
					feedbackContext.handleException(e)
				})
				.finally(() => setLoading(false))
		}
	}, [userId])

	const formik = useFormik({
		initialValues: {
			email: user?.email || '',
			password: '',
			confirmPassword: '',
		},
		enableReinitialize: true,
		validationSchema: Yup.object({
			email: Yup.string().email('Invalid email address').required('Required'),
			password: Yup.string(),
			confirmPassword: Yup.string().test((value, ctx) => {
				if (ctx.parent.password !== value) {
					return ctx.createError({
						message: 'Password and Confirm Password must match',
					})
				}
				return true
			}),
		}),
		onSubmit: async (values, { setFieldError }) => {
			feedbackContext.clear()
			setLoading(true)
			if (userId) {
				return await api
					.updateUser(user.id, values.email, values.password)
					.then((data) => {
						setUser(data.user)
						feedbackContext.indicateSuccess('User updated:' + data?.user?.email)
						close(true)
					})
					.catch((e) => {
						if (e?.graphQLErrors) {
							const helper = new FormikErrorMessageHelper(setFieldError, {
								'Email already in use': {
									field: 'email',
									message: 'Email already in use',
								},
							})
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
					.addUser(values.email, values.password)
					.then((data) => {
						setUser(data.user)
						feedbackContext.indicateSuccess('User added.')
						close(true)
						return true
					})
					.catch((e) => {
						feedbackContext.handleException(e)
						return false
					})
					.finally(() => {
						setLoading(false)
					})
			}
		},
	})

	const handleDelete = () => {
		if (confirm('Are you sure you want to delete this user?')) {
			setLoading(true)
			api
				.deleteUser(user.id)
				.then(() => {
					feedbackContext.indicateSuccess('User deleted')
					close(true)
				})
				.catch((e) => {
					feedbackContext.handleException(e)
				})
				.finally(() => {
					setLoading(false)
				})
		}
	}

	return (
		<LoadingBlocker loading={loading}>
			<form onSubmit={formik.handleSubmit} className="record">
				<div className="field">
					<label>
						<span>Email Address</span>
						<input
							type="input"
							name="email"
							onChange={formik.handleChange}
							value={formik.values.email}
						/>
					</label>
					<div className="error">{formik.errors.email}</div>
				</div>
				<div className="field">
					<label>
						<span>Password</span>
						<input
							type="password"
							name="password"
							onChange={formik.handleChange}
							value={formik.values.password}
						/>
					</label>
					<div className="error">{formik.errors.password}</div>
				</div>
				<div className="field">
					<label>
						<span>Confirm Password</span>
						<input
							type="password"
							name="confirmPassword"
							onChange={formik.handleChange}
							value={formik.values.confirmPassword}
						/>
					</label>
					<div className="error">{formik.errors.confirmPassword}</div>
				</div>

				<div className="actions">
					<button
						type="submit"
						className="theme"
						disabled={!formik.dirty || formik.error}
					>
						Update
					</button>
					<button
						type="button"
						className="theme danger"
						onClick={() => handleDelete(user.id)}
					>
						Delete
					</button>
					<button type="button" className="theme plain" onClick={() => close(false)}>
						Cancel
					</button>
				</div>
			</form>
		</LoadingBlocker>
	)
}

EditUserForm.propTypes = {
	userId: PropTypes.string.isRequired,
	close: PropTypes.func.isRequired,
}

export default EditUserForm
