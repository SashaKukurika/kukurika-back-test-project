import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CurrencyService {
  async getCurrencyRates() {
    try {
      const response = await axios.get(
        'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5',
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      return [];
    }
  }
}
