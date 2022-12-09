import * as Sentry from '@sentry/node';
import { Logger } from 'simple-node-logger';

const devEnv = 'development';
export function sentryInit(dsn: string, env: string, logger?: Logger): void {
  if (!dsn) {
    logger?.info('sentry dsn not provided, can not be initialized');
    return;
  }

  logger?.info('Initializing sentry');
  Sentry.init({
    dsn,
    debug: env === devEnv,
    environment: env,
    // beforeSend(event: any) {
    //   //todo strip PII from event
    //   return event;
    // },
  });
}

//we can provide addition tags/context for errors
export function setSentryContext(userId?: string, username?: string): void {
  let user = {};
  if (userId) {
    user = { id: userId };
  }
  if (username) {
    user = { ...user, ...{ username } };
  }
  Sentry.setUser(user);
}
