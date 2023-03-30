class Api {
  constructor({ baseUrl, commonHeaders }) {
    this._baseUrl = baseUrl;
    this._headers = commonHeaders;
  }

  _getData(res) {
    return res.json().then(obj => {
      if (res.ok) return obj; else throw obj;
    });
  }

  getUserInfo() {
    return fetch(`${this._baseUrl}/users/me`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(this._getData);
  }

  getInitialCards() {
    return fetch(`${this._baseUrl}/cards`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(this._getData);
  }

  editProfile(newData) {
    return fetch(`${this._baseUrl}/users/me`, {
      method: 'PATCH',
      headers: this._headers,
      body: JSON.stringify(newData),
      credentials: 'include'
    })
    .then(this._getData);
  }

  addNewCard(cardData) {
    return fetch(`${this._baseUrl}/cards`, {
      method: 'POST',
      headers: this._headers,
      body: JSON.stringify(cardData),
      credentials: 'include'
    })
    .then(this._getData);
  }

  removeCard({_id}) {
    return fetch(`${this._baseUrl}/cards/${_id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    .then(this._getData);
  }

  likeCard(isLiked, {_id}) {
    return fetch(`${this._baseUrl}/cards/${_id}/likes`, {
      method: isLiked ? 'PUT' : 'DELETE',
      credentials: 'include'
    })
    .then(this._getData);
  }

  setAvatar(data) {
    return fetch(`${this._baseUrl}/users/me/avatar`, {
      method: 'PATCH',
      headers: this._headers,
      body: JSON.stringify(data),
      credentials: 'include'
    })
    .then(this._getData);
  }
}

const api = new Api({
  baseUrl: 'https://api.mesto.deneroxin.nomoredomains.work',
  headers: {
    'Content-Type': 'application/json; charset="utf-8"'
  }
});

export default api;
