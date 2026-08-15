import api from './api'

export function getTransactions() {
  return api.get('/transactions')
}

export function getTransaction(id) {
  return api.get(`/transactions/${id}`)
}

export function createTransaction(payload) {
  return api.post('/transactions', payload)
}

export function updateTransaction(id, payload) {
  return api.put(`/transactions/${id}`, payload)
}

export function deleteTransaction(id) {
  return api.delete(`/transactions/${id}`)
}

/**
 * GET /transactions/filter
 * All parameters are optional: type, category, minimum_amount, maximum_amount
 */
export function filterTransactions(params = {}) {
  const query = new URLSearchParams()
  if (params.type) query.append('type', params.type)
  if (params.category) query.append('category', params.category)
  if (params.minimum_amount != null && params.minimum_amount !== '') {
    query.append('minimum_amount', params.minimum_amount)
  }
  if (params.maximum_amount != null && params.maximum_amount !== '') {
    query.append('maximum_amount', params.maximum_amount)
  }
  const qs = query.toString()
  return api.get(`/transactions/filter${qs ? `?${qs}` : ''}`)
}