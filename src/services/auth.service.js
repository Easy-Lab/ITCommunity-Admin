import axios from 'axios';

const API_URL = 'https://api-itcommunity.atcreative.fr/';

class AuthService {
  async login(user) {
    const response = await axios
      .post(API_URL + 'login_check', {
        username: user.username,
        password: user.password
      });

    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('roles');
    localStorage.removeItem('username');
  }

  register(user) {
    return axios.post(API_URL + 'users', {
      username: user.username,
      email: user.email,
      password: user.password,
      roles: user.roles
    });
  }
}

export default new AuthService();
