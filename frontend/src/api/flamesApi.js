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
    throw new Error(
      payload?.error ||
      payload?.detail ||
      rawBody ||
      `Request failed with status ${response.status}.`,
    )
  }

  return payload || {}
}

const getAuthTokenOrThrow = () => {
  const authToken = localStorage.getItem('flames_auth_token')

  if (!authToken) {
    throw new Error('Please login to continue.')
  }

  return authToken
}

const buildAuthHeaders = () => {
  const authToken = getAuthTokenOrThrow()
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Token ${authToken}`,
  }

  return headers
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

export const calculateFlamesApi = async ({ name1, name2 }) => {
  return performRequest(`${API_BASE_URL}/api/flames/`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify({ name1, name2 }),
  })
}

export const getFlamesHistoryApi = async (limit = 20) => {
  return performRequest(`${API_BASE_URL}/api/flames/history/?limit=${limit}`, {
    method: 'GET',
    headers: buildAuthHeaders(),
  })
}

export const getMyResultsApi = async () => {
  return getFlamesHistoryApi(20)
}
