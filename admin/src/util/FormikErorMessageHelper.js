export default class FormikErrorMessageHelper {
	allHandled
	errorConfig = {}
	setFieldError

	constructor(setFieldError, errorConfig) {
		this.allHandled = true
		this.errorConfig = errorConfig
		this.setFieldError = setFieldError
		this.unhandled = []
	}

	handleAll = function (errors) {
		let allHandled = true
		if (Array.isArray(errors)) {
			errors?.forEach((error) => {
				if (!this.handleFormik(error)) {
					allHandled = false
					this.unhandled.push(error)
				}
			})
		} else {
			allHandled = false
		}
		return allHandled
	}

	handleFormik = function (error) {
		const handler = this.errorConfig[error.message]
		if (handler) {
			this.setFieldError(handler.field, handler.message)
			return true
		} else {
			return false
		}
	}
}
