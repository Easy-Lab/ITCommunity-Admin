import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'https://api-itcommunity.atcreative.fr/';

class BugReportService {
  getBugReports() {
    return axios.get(API_URL + 'bugreports?limit=0', {headers: authHeader()});
  }
}

export default new BugReportService();
