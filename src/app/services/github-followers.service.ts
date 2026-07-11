import { DataService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable()
export class GithubFollowersService extends DataService {

  constructor() {
    const http = inject(HttpClient);

    super('https://api.github.com/users/mosh-hamedani/followers', http);
  }
}
