import dayjs from 'dayjs'

const formatDate = (date) => {
	return dayjs(date).format('YYYY-MM-DD HH:mm')
}

export default formatDate
