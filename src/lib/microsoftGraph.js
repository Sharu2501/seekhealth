import * as msal from '@azure/msal-browser'

const requestedScopes = {
    scopes: ['User.Read', 'Mail.Read']
}

const msalInstance = new msal.PublicClientApplication({
    auth: {
        clientId: import.meta.env.VITE_OAUTH_CLIENT_ID,
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: 'sessionStorage',
    },
})

let isInitialized = false
async function ensureInitialized() {
    if (!isInitialized) {
        await msalInstance.initialize()
        isInitialized = true
    }
}

export async function signInAndGetUser() {
    await ensureInitialized()
    const result = await msalInstance.loginPopup(requestedScopes)
    msalInstance.setActiveAccount(result.account)

    return {
        name: result.account.name,
        email: result.account.username,
        ...result.account
    }
}

export async function getUserMails() {
    await ensureInitialized()
    const account = msalInstance.getActiveAccount()
    if (!account) throw new Error('Utilisateur non connecté')

    const token = await msalInstance.acquireTokenSilent({
        scopes: ['Mail.Read'],
        account
    })

    const res = await fetch('https://graph.microsoft.com/v1.0/me/messages', {
        headers: {
            Authorization: `Bearer ${token.accessToken}`
        }
    })

    const data = await res.json()
    return data.value
}
