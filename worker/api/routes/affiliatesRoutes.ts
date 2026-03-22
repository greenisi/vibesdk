/**
 * Affiliate Tracking Routes
 */

import { Hono } from 'hono';
import { AppEnv } from '../../types/appenv';
import { adaptController } from '../honoAdapter';
import { AuthConfig, setAuthLevel } from '../../middleware/auth/routeAuth';
import { AffiliatesController } from '../controllers/affiliates/controller';

export function setupAffiliatesRoutes(app: Hono<AppEnv>): void {
    const affiliatesRouter = new Hono<AppEnv>();

    affiliatesRouter.get('/track', setAuthLevel(AuthConfig.public), adaptController(AffiliatesController, AffiliatesController.track));

    app.route('/api/affiliates', affiliatesRouter);
}
