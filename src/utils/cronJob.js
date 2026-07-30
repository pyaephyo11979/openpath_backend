const cron = require('node-cron');
const NodeCache = require('node-cache');
const userModel = require('#models/user.model.js');
const { getMessaging } = require('firebase-admin/messaging');

const UserCache = new NodeCache({ stdTTL: 3600 });

const sentReminderNoti = cron.schedule('* * * * *', async () => {
  const cacheKey = 'reminderUsers';
  try {
    let users = UserCache.get(cacheKey);
    if (!users) {
      users = await userModel.getUsers();
      UserCache.set(cacheKey, users);
    }

    const results = await Promise.allSettled(
      users
        .filter((user) => user.fcmToken)
        .map(async (user) => {
          const message = {
            notification: {
              title: 'Reminder for OpenPath',
              body: 'Start Your Learning Journey Now',
            },
            token: user.fcmToken,
          };
          await getMessaging().send(message);
        })
    );

    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      console.error(
        `[CronJob] ${failures.length}/${results.length} notifications failed`
      );
    }
  } catch (err) {
    console.error('[CronJob] Fatal error:', err);
  }
});

module.exports = {
  sentReminderNoti,
};
