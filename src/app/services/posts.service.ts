import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';

@Injectable()
export class PostsService extends DataService {
  constructor() {
    const http = inject(HttpClient);

    super('https://jsonplaceholder.typicode.com/posts', http);
   }
}
