class Auth {
  constructor({ baseUrl, commonHeaders }) {
    this._baseUrl = baseUrl;
    this._headers = commonHeaders;
  }

  _getData(res) {
    return res.json().then(obj => {
      if (res.ok) return obj; else throw obj;
    });
  }

  signUp(body) {
    return fetch(`${this._baseUrl}/signup`, {
      method: 'POST',
      headers: this._headers,
      body: JSON.stringify(body)
    })
    .then(this._getData);
  }

  signIn(body) {
    return fetch(`${this._baseUrl}/signin`, {
      method: 'POST',
      headers: this._headers,
      body: JSON.stringify(body),
      credentials: 'include' // Если авторизуемся через куки.
    })
    .then(this._getData);
  }

  signOut() {
    return fetch(`${this._baseUrl}/signout`, {
      method: 'GET',
    })
    .then(this._getData);
  }
}

const auth = new Auth({
  baseUrl: 'https://api.mesto.deneroxin.nomoredomains.work',
  commonHeaders: {
    'Content-Type': 'application/json; charset="utf-8"'
  }
});

export default auth;
