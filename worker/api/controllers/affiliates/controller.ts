/**
 * Affiliate Tracking Controller
 */

import { parseCookies, createSecureCookie } from '../../../utils/authUtils';
import { BaseController } from '../baseController';
import { RouteContext } from '../../types/route-context';
import { createLogger } from '../../../logger';

const REFERRAL_COOKIE_NAME = 'referral_code';
const REFERRAL_COOKIE_TTL = 30 * 24 * 60 * 60; // 30 days

export class AffiliatesController extends BaseController {
    static logger = createLogger('AffiliatesController');

    /**
     * Track an affiliate referral
     * GET /api/affiliates/track?ref=CODE&redirect=/some/path
     */
    static async track(request: Request, _env: Env, _ctx: ExecutionContext, routeContext: RouteContext): Promise<Response> {
        try {
            const ref = routeContext.queryParams.get('ref');

            if (!ref || ref.trim().length === 0) {
                return AffiliatesController.createErrorResponse('Missing ref parameter', 400);
            }

            // Validate ref code: alphanumeric + hyphens/underscores, max 64 chars
            if (!/^[A-Za-z0-9_-]{1,64}$/.test(ref)) {
                return AffiliatesController.createErrorResponse('Invalid ref parameter', 400);
            }

            const redirectTo = routeContext.queryParams.get('redirect') || '/';
            const origin = new URL(request.url).origin;
            const location = new URL(redirectTo, origin).toString();

            // Only set the cookie if not already present (first-touch attribution)
            const cookieHeader = request.headers.get('Cookie');
            const existing = cookieHeader ? parseCookies(cookieHeader)[REFERRAL_COOKIE_NAME] : null;

            const headers = new Headers({ Location: location });

            if (!existing) {
                headers.append(
                    'Set-Cookie',
                    createSecureCookie({
                        name: REFERRAL_COOKIE_NAME,
                        value: ref,
                        maxAge: REFERRAL_COOKIE_TTL,
                        sameSite: 'Lax',
                    }),
                );

                AffiliatesController.logger.info('Referral cookie set', { ref });
            }

            return new Response(null, { status: 302, headers });
        } catch (error) {
            return AffiliatesController.handleError(error, 'track affiliate');
        }
    }
}
