/**
 * Turn any API/network error into a human-friendly message.
 * Raw Axios errors are never shown to the user.
 */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback

  if (error.code === 'ERR_NETWORK') {
    return 'We could not reach the server. Check your connection and try again.'
  }
  if (error.code === 'ECONNABORTED') {
    return 'The request took too long. Please try again.'
  }

  const status = error.response?.status
  const data = error.response?.data

  if (!status) return fallback

  switch (status) {
    case 400:
      return data?.detail ?? 'The request was invalid. Please check your input.'
    case 401:
      return data?.detail ?? 'Your session has expired. Please log in again.'
    case 403:
      return 'You do not have permission to do that.'
    case 404:
      return data?.detail ?? 'We could not find what you are looking for.'
    case 409:
      return data?.detail ?? 'That already exists. Please try something else.'
    case 422: {
      const detail = data?.detail
      if (Array.isArray(detail) && detail.length > 0) {
        const first = detail[0]
        const field = first?.loc?.slice(-1)[0]
        const msg = first?.msg?.replace(/^Value error, /, '')
        if (field && msg) return `${capitalize(field)}: ${msg}`
      }
      return data?.detail ?? 'Please check your information and try again.'
    }
    case 500:
      return 'We hit a server problem. Please try again in a moment.'
    default:
      return data?.detail ?? fallback
  }
}

export function getFieldErrors(error) {
  const detail = error?.response?.data?.detail
  if (!Array.isArray(detail)) return {}
  return detail.reduce((acc, item) => {
    const field = item?.loc?.slice(-1)[0]
    if (field) {
      acc[field] = item?.msg?.replace(/^Value error, /, '') ?? 'Invalid value'
    }
    return acc
  }, {})
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}