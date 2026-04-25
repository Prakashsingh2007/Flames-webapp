import { API_BASE_URL, logApi } from './config'

const parseResponse = async (response) => {
  const rawBody = await response.text()
  let payload = null

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody)
    } catch {
      payload = null
    }
  }

  logApi('response', response.status, response.url, payload || rawBody)

  if (!response.ok) {
    const message =
      payload?.detail ||
      payload?.error ||
      (typeof payload === 'object' && payload !== null
        ? Object.values(payload).flat().join(' ')
        : rawBody || `Request failed with status ${response.status}.`)

    throw new Error(message || 'Request failed.')
  }

  return payload || {}
}

const performRequest = async (url, options) => {
  logApi('request', options.method || 'GET', url, options.body || null)

  try {
    const response = await fetch(url, options)
    return await parseResponse(response)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Cannot connect to backend at ${API_BASE_URL}. Confirm Django is running at http://127.0.0.1:8000.`,
      )
    }

    throw error
  }
}

export const registerApi = async ({ username, email, password }) => {
  return performRequest(`${API_BASE_URL}/api/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  })
}

export const loginApi = async ({ username, password }) => {
  return performRequest(`${API_BASE_URL}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
}

export const logoutApi = async () => {
  const token = localStorage.getItem('flames_auth_token')

  if (!token) return

  return performRequest(`${API_BASE_URL}/api/auth/logout/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
  })
}