import { HttpErrorResponse } from '@angular/common/http';

export class AppError {
    constructor(public originalError?: HttpErrorResponse | Error | unknown) {}
}

