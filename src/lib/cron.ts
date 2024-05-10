import { env } from '../utils/env.js';
import { CronJob } from 'cron';
import { lucia } from './lucia.js';

const deleteExpiredSessions = async () => {
  await lucia.deleteExpiredSessions();
};

export const registerDailyCronJob = () => {
  if (process.env.NODE_ENV === 'test') return;

  const cron = new CronJob(`${env.DAILY_CRON_HOUR} ${env.DAILY_CRON_MINUTE} * * *`, deleteExpiredSessions, null, true, 'utc');

  return cron;
};
