import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'https://api-itcommunity.atcreative.fr/';

class UserService {
  getUsers() {
    return axios.get(API_URL + 'users?limit=0', {headers: authHeader()});
  }

  getUsersReviews() {
    return axios.get(API_URL + 'users?limit=0&expand=reviews', {headers: authHeader()});
  }

  getUserAccount() {
    return axios.get(API_URL + 'users/my-account', {headers: authHeader()});
  }

  getUser(username) {
    return axios.get(API_URL + 'users/' + username, {headers: authHeader()});
  }

  getUserReviews(username) {
    return axios.get(API_URL + 'users/' + username + '/reviews', {headers: authHeader()});
  }
}

export default new UserService();
