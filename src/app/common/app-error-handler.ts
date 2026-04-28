import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class AppErrorHandler implements ErrorHandler {

    handleError(error: Error | unknown): void {
        // In a real app, you'd send this to a logging service (e.g., Sentry)
        console.error('An unexpected error occurred:', error);
        // alert() is blocking and bad UX — components should handle errors via observables
    }

}
