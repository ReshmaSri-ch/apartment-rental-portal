import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            console.error('🚨 ERROR INTERCEPTOR:', {
                url: req.url,
                status: error.status,
                message: error.message
            });

            if (error.status === 401) {
                console.warn('⚠️ 401 UNAUTHORIZED - Clearing localStorage and redirecting to login');
                // Token expired or invalid - clear storage and redirect to login
                localStorage.clear();
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};
