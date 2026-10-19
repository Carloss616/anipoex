// AniList's implicit grant lands on the redirect with `access_token` in the fragment, or `error` when the user denies.
export const authRedirect = (url) => /[?#&](access_token|error)=/.test(url);
