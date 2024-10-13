import React from 'react'
import PropTypes from 'prop-types'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const UserAccountForm = ({ user, handleUpdate, handleDelete }) => {
	const formik = useFormik({
		initialValues: {
			email: user?.email || '',
			firstName: user?.firstName || '',
			lastName: user?.lastName || '',
			password: '',
			confirmPassword: '',
		},
		enableReinitialize: true,
		validationSchema: Yup.object({
			email: Yup.string().email('Invalid email address').required('Required'),
			firstName: Yup.string(),
			lastName: Yup.string(),
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
		onSubmit: async (values, { setFieldError, resetForm }) => {
			await handleUpdate(values, setFieldError)
			resetForm()
		},
	})

	return (
		<form onSubmit={formik.handleSubmit} className="record">
			<div className="balanced-row fill">
				<div className="field">
					<label>
						<span>First Name</span>
						<input
							type="input"
							name="firstName"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.firstName}
						/>
					</label>
					{formik.touched.firstName && formik.errors.firstName ? (
						<div className="error">{formik.errors.firstName}</div>
					) : null}
				</div>
				<div className="field">
					<label>
						<span>Last Name</span>
						<input
							type="input"
							name="lastName"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.lastName}
						/>
					</label>
					{formik.touched.lastName && formik.errors.lastName ? (
						<div className="error">{formik.errors.lastName}</div>
					) : null}
				</div>
			</div>
			<div className="field">
				<label>
					<span>Email Address</span>
					<input
						type="input"
						name="email"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.email}
					/>
				</label>
				{formik.touched.email && formik.errors.email ? (
					<div className="error">{formik.errors.email}</div>
				) : null}
			</div>
			<div className="field">
				<label>
					<span>Password</span>
					<input
						type="password"
						name="password"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.password}
					/>
				</label>
				{formik.touched.password && formik.errors.password ? (
					<div className="error">{formik.errors.password}</div>
				) : null}
			</div>
			<div className="field">
				<label>
					<span>Confirm Password</span>
					<input
						type="password"
						name="confirmPassword"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.confirmPassword}
					/>
				</label>
				{formik.touched.confirmPassword && formik.errors.confirmPassword ? (
					<div className="error">{formik.errors.confirmPassword}</div>
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
				{!handleDelete ? null : (
					<button
						type="button"
						className="theme danger"
						onClick={() => handleDelete()}
					>
						Delete
					</button>
				)}
			</div>
		</form>
	)
}

UserAccountForm.propTypes = {
	user: PropTypes.shape({
		email: PropTypes.string.isRequired,
		firstName: PropTypes.string,
		lastName: PropTypes.string,
	}),
	handleUpdate: PropTypes.func.isRequired,
	handleDelete: PropTypes.func,
}

export default UserAccountForm
