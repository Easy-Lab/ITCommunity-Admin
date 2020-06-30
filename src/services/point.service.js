import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'https://api-itcommunity.atcreative.fr/';

class PointService {
  getTopTenUser() {
    return axios.get(API_URL + 'points', {headers: authHeader()});
  }
}

export default new PointService();
