const findChangedFieldsFormik = (formik) => {
	const names = []
	for (let name in formik.values) {
		if (formik.initialValues[name] !== formik.values[name]) {
			names.push(name)
		}
	}
	return names
}

// takes a reference to formik, the form it references and an onFinish function that should close the modal dialog
// if the form has been changed (formik.dirty) then focus to the first changed field
// if the form has not changed, call onFinish which should close the modal dialog container
const formikModalOnClose = (formik, formRef, onFinished) => {
	return () => {
		if (formik.dirty) {
			const changedFields = findChangedFieldsFormik(formik)
			if (changedFields.length) {
				const input = formRef.current.querySelector(
					`input[name="${changedFields[0]}"]`
				)
				if (input) {
					input.focus()
				}
			}
		} else {
			onFinished(false)
		}
	}
}

export default formikModalOnClose
