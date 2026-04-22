export const getToken = () => localStorage.getItem('bp_token')
export const setToken = (token) => localStorage.setItem('bp_token', token)
export const removeToken = () => localStorage.removeItem('bp_token')

export const getUser = () => JSON.parse(localStorage.getItem('bp_user') || 'null')
export const setUser = (user) => localStorage.setItem('bp_user', JSON.stringify(user))
export const removeUser = () => localStorage.removeItem('bp_user')

export const isAuthenticated = () => !!getToken()
