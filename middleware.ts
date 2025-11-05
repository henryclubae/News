import createMiddleware from 'next-intl/middleware';
import { routing } from './src/lib/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(de|en|es|fr|zh|ar)/:path*']
};