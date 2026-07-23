const AUTH_REDIRECT_KEY = 'pending_auth_redirect'

export function saveAuthRedirect(path) {
  if (!path) return
  try {
    sessionStorage.setItem(AUTH_REDIRECT_KEY, path)
  } catch (error) {
    console.error('saveAuthRedirect error:', error)
  }
}

export function getAuthRedirect(defaultPath = '/') {
  try {
    return sessionStorage.getItem(AUTH_REDIRECT_KEY) || defaultPath
  } catch (error) {
    console.error('getAuthRedirect error:', error)
    return defaultPath
  }
}

export function clearAuthRedirect() {
  try {
    sessionStorage.removeItem(AUTH_REDIRECT_KEY)
  } catch (error) {
    console.error('clearAuthRedirect error:', error)
  }
}

export function resolveAuthRedirect(redirectFrom, defaultPath = '/') {
  if (redirectFrom) {
    saveAuthRedirect(redirectFrom)
    return redirectFrom
  }
  return getAuthRedirect(defaultPath)
}
