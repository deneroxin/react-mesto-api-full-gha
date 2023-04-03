class Api {
  constructor({ baseUrl, commonHeaders }) {
    this._baseUrl = baseUrl;
    this._headers = commonHeaders;
    this._auth = {};  // Если авторизуемся через заголовки.
  }

  _getData(res) {
    return res.json().then(obj => {
      if (res.ok) return obj; else throw obj;
    });
  }

  // Если авторизуемся через заголовки, нужен этот метод.
  setAuthorizationHeader(jwt) {
    this._auth['Authorization'] = `Bearer ${jwt}`;
  }

  // Если авторизуемся через заголовки, нужен этот метод.
  clearAuthorizationHeader() {
    delete this._auth['Authorization'];
  }

  getUserInfo() {
    return fetch(`${this._baseUrl}/users/me`, {
      method: 'GET',
      headers: this._auth, // Если авторизуемся через заголовки.
      credentials: 'include' // Если авторизуемся через куки.
    })
    .then(this._getData);
  }

  getInitialCards() {
    return fetch(`${this._baseUrl}/cards`, {
      method: 'GET',
      headers: this._auth, // Если авторизуемся через заголовки.
      credentials: 'include' // Если авторизуемся через куки.
    })
    .then(this._getData);
  }

  editProfile(newData) {
    return fetch(`${this._baseUrl}/users/me`, {
      method: 'PATCH',
      headers: { ...this._headers, ...this._auth },
      body: JSON.stringify(newData),
      credentials: 'include' // Если авторизуемся через куки.
    })
    .then(this._getData);
  }

  addNewCard(cardData) {
    return fetch(`${this._baseUrl}/cards`, {
      method: 'POST',
      headers: { ...this._headers, ...this._auth },
      body: JSON.stringify(cardData),
      credentials: 'include' // Если авторизуемся через куки.
    })
    .then(this._getData);
  }

  removeCard({_id}) {
    return fetch(`${this._baseUrl}/cards/${_id}`, {
      method: 'DELETE',
      headers: this._auth, // Если авторизуемся через заголовки.
      credentials: 'include' // Если авторизуемся через куки.
    })
    .then(this._getData);
  }

  likeCard(isLiked, {_id}) {
    return fetch(`${this._baseUrl}/cards/${_id}/likes`, {
      method: isLiked ? 'PUT' : 'DELETE',
      headers: this._auth, // Если авторизуемся через заголовки.
      credentials: 'include' // Если авторизуемся через куки.
    })
    .then(this._getData);
  }

  setAvatar(data) {
    return fetch(`${this._baseUrl}/users/me/avatar`, {
      method: 'PATCH',
      headers: { ...this._headers, ...this._auth },
      body: JSON.stringify(data),
      credentials: 'include' // Если авторизуемся через куки.
    })
    .then(this._getData);
  }
}

const api = new Api({
  baseUrl: 'https://api.mesto.deneroxin.nomoredomains.work',
  commonHeaders: {
    'Content-Type': 'application/json; charset="utf-8"'
  }
});

export default api;
