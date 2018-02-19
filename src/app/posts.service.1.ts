import { AppError } from './common/app-error';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { NotFoundError } from './common/not-found-error';
import { BadInput } from './common/bad-input';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class PostsService {
  private url= 'http://jsonplaceholder.typicode.com/posts';
  constructor(private http: Http) { }

  getPosts() {
    return this.http.get(this.url)
      .catch(this.handleError);
  }

  createPost(post) {
    return this.http.post(this.url, post)
      .catch(this.handleError);
  }

  updatePost(post) {
    return this.http.patch(this.url + '/' + post.id, {title: 'data updated'})
      .catch(this.handleError);
  }

  deletePost(id) {
    return this.http.delete(this.url + '/' + id)
      .catch(this.handleError);
  }

  private handleError(error: Response) {
    if (error.status === 400) {
        return Observable.throw(new BadInput(error.json()));
    }

    if (error.status === 404) {
      return Observable.throw(new NotFoundError());
    }

      return Observable.throw(new AppError(error));
  }

}
