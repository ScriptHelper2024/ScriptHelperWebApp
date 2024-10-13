const getElementText = (e) => e.innerHTML.replace(/<\/?[^>]+(>|$)/g, '')

export default getElementText
