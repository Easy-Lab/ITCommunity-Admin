import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'https://api-itcommunity.atcreative.fr/';

class ContactFormsService {
  getContactForms() {
    return axios.get(API_URL + 'contactforms?limit=0', {headers: authHeader()});
  }
  deleteContactForms(hash) {
    return axios.delete(API_URL + 'contactforms/' + hash, {headers: authHeader()});
  }
}

export default new ContactFormsService();
