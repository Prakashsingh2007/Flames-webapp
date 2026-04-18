const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const parseResponse = async (response) => {
  let payload = null

  try {
    payload = await response.json()
  } catch {
    throw new Error('Unable to read API response. Please try again.')
  }

  if (!response.ok) {
    throw new Error(payload.error || payload.detail || 'Request failed.')
  }

  return payload
}

const buildAuthHeaders = () => {
  const authToken = localStorage.getItem('flames_auth_token')
  const headers = {
    'Content-Type': 'application/json',
  }

  if (authToken) {
    headers.Authorization = `Token ${authToken}`
  }

  return headers
}

export const calculateFlamesApi = async ({ name1, name2 }) => {
  const response = await fetch(`${API_BASE_URL}/api/flames/`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify({ name1, name2 }),
  })

  return parseResponse(response)
}

export const getFlamesHistoryApi = async (limit = 20) => {
  const response = await fetch(`${API_BASE_URL}/api/flames/history/?limit=${limit}`, {
    method: 'GET',
    headers: buildAuthHeaders(),
  })

  return parseResponse(response)
}

export const getMyResultsApi = async () => {
  const authToken = localStorage.getItem('flames_auth_token')

  if (!authToken) {
    return []
  }

  const response = await fetch(`${API_BASE_URL}/api/flames/my-results/`, {
    method: 'GET',
    headers: buildAuthHeaders(),
  })

  return parseResponse(response)
}
