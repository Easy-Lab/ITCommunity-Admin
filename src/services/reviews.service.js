import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'https://api-itcommunity.atcreative.fr/';

class ReviewsService {
  getReviews() {
    return axios.get(API_URL + 'reviews', {headers: authHeader()});
  }

  getReviewsUsers() {
    return axios.get(API_URL + 'reviews?limit=0&expand=user', {headers: authHeader()});
  }
}

export default new ReviewsService();
