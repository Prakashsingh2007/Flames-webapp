const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const parseResponse = async (response) => {
  let payload = null

  try {
    payload = await response.json()
  } catch {
    throw new Error('Unable to read API response.')
  }

  if (!response.ok) {
    const message =
      payload.detail ||
      payload.error ||
      (typeof payload === 'object' ? Object.values(payload).flat().join(' ') : 'Request failed.')

    throw new Error(message || 'Request failed.')
  }

  return payload
}

export const registerApi = async ({ username, email, password }) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  })

  return parseResponse(response)
}

export const loginApi = async ({ username, password }) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  return parseResponse(response)
}

export const logoutApi = async () => {
  const token = localStorage.getItem('flames_auth_token')

  if (!token) {
    return
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/logout/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
  })

  await parseResponse(response)
}
