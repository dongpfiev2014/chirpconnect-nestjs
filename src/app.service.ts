import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  // constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}
  async getHello() {
    // const cachedValue: any = await this.cacheManager.get('my_key');
    // if (cachedValue && cachedValue.length !== 0) {
    //   console.log('From cache');
    //   return cachedValue;
    // }
    const response = await axios
      .get('https://jsonplaceholder.typicode.com/users')
      .then((res) => res.data);
    // await this.cacheManager.set('my_key', response, 30000);
    // console.log('From API');

    //When something changes
    // await this.cacheManager.del(`user_${userId}_key`);

    return response;
  }
}
