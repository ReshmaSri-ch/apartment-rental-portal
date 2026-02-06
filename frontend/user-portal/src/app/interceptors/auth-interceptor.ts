import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  console.log('🔐 AUTH INTERCEPTOR:', {
    url: req.url,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN'
  });

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('✅ Added Authorization header to request');
  } else {
    console.warn('⚠️ NO TOKEN - Request will be sent without Authorization header!');
  }

  return next(req);
};
