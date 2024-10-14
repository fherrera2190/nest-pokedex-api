import { Injectable } from '@nestjs/common';
import { HttpAdapter } from '../interfaces/http-adapter.interface';

@Injectable()
export class FetchAdapter implements HttpAdapter {
  async get<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      const data = await response.json();
      //console.log(data);
      return data;
    } catch (error) {
      console.log(error);
      throw new Error(`This is an error - check server logs`);
    }
  }
}
