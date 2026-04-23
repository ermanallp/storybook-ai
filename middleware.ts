import createMiddleware from 'next-intl/middleware';
import { routing } from './navigation';

export default createMiddleware(routing);

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(de|en|fr|es|it|tr|zh|ja|ko)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
