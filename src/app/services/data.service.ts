import { AppError } from './../common/app-error';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotFoundError } from '../common/not-found-error';
import { BadInput } from '../common/bad-input';

export class DataService {
  constructor(private url: string, private http: HttpClient) { }

  getAll<T>(): Observable<T[]> {
    return this.http.get<T[]>(this.url)
        .pipe(catchError(error => this.handleError(error)));
  }

  create<T>(resource: T): Observable<T> {
    return this.http.post<T>(this.url, resource)
        .pipe(catchError(error => this.handleError(error)));
  }

  update<T>(resource: { id: number | string }): Observable<T> {
    return this.http.patch<T>(this.url + '/' + resource.id, { title: 'data updated' })
        .pipe(catchError(error => this.handleError(error)));
  }

  delete<T>(id: number | string): Observable<T> {
    return this.http.delete<T>(this.url + '/' + id)
        .pipe(catchError(error => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 400) {
        return throwError(() => new BadInput(error.error));
    }

    if (error.status === 404) {
      return throwError(() => new NotFoundError());
    }

    return throwError(() => new AppError(error));
  }
}

