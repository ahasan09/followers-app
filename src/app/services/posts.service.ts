import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { DataService } from './data.service';

@Injectable()
export class PostsService extends DataService {
  constructor(http: Http) {
    super('http://jsonplaceholder.typicode.com/posts', http);
   }
}
