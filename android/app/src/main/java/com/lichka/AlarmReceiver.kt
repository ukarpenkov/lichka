package com.lichka

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val messageId = intent.getStringExtra(AlarmScheduler.EXTRA_MESSAGE_ID) ?: return
        val chatId = intent.getStringExtra(AlarmScheduler.EXTRA_CHAT_ID) ?: return
        val body = intent.getStringExtra(AlarmScheduler.EXTRA_BODY) ?: return
        val chatTitle = intent.getStringExtra(AlarmScheduler.EXTRA_CHAT_TITLE) ?: return
        val intervalMinutes = intent.getIntExtra(AlarmScheduler.EXTRA_INTERVAL_MINUTES, 0)
        val isAlarm = intent.getBooleanExtra(AlarmScheduler.EXTRA_IS_ALARM, false)

        if (intent.action == NotificationHelper.snoozeAction) {
            handleSnooze(context, messageId, chatId, body, chatTitle, intervalMinutes, isAlarm)
        } else {
            handleAlarm(context, messageId, chatId, body, chatTitle, intervalMinutes, isAlarm)
        }
    }

    private fun handleAlarm(
        context: Context,
        messageId: String,
        chatId: String,
        body: String,
        chatTitle: String,
        intervalMinutes: Int,
        isAlarm: Boolean,
    ) {
        if (isAlarm) {
            // Fallback: старые будильники (до обновления) могут прийти через BroadcastReceiver.
            // Используем Notification + setFullScreenIntent — работает даже при убитом приложении.
            val notification =
                NotificationHelper.buildAlarmNotification(
                    context, body, chatTitle, chatId, messageId,
                )
            val manager =
                context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.notify(messageId.hashCode(), notification)
        } else {
            val notification =
                NotificationHelper.buildReminderNotification(
                    context, body, chatTitle, chatId, messageId, intervalMinutes,
                )
            val manager =
                context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.notify(messageId.hashCode(), notification)
        }

        if (intervalMinutes > 0) {
            val nextTrigger = System.currentTimeMillis() + intervalMinutes * 60_000L
            AlarmScheduler.schedulePeriodicFirst(
                context, messageId, chatId, body, chatTitle, intervalMinutes, nextTrigger,
            )
        } else {
            // Одноразовое уведомление — удаляем из хранилища
            AlarmStorage.remove(context, messageId)
        }
    }

    private fun handleSnooze(
        context: Context,
        messageId: String,
        chatId: String,
        body: String,
        chatTitle: String,
        intervalMinutes: Int,
        isAlarm: Boolean,
    ) {
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.cancel(messageId.hashCode())

        val snoozeTrigger =
            System.currentTimeMillis() + NotificationHelper.snoozeMinutes() * 60_000L
        // schedule* уже сохраняют в AlarmStorage, старая запись будет заменена
        if (isAlarm) {
            AlarmScheduler.scheduleAlarm(
                context, messageId, chatId, body, chatTitle, snoozeTrigger,
            )
        } else if (intervalMinutes > 0) {
            AlarmScheduler.schedulePeriodicFirst(
                context, messageId, chatId, body, chatTitle, intervalMinutes, snoozeTrigger,
            )
        } else {
            AlarmScheduler.scheduleReminder(
                context, messageId, chatId, body, chatTitle, snoozeTrigger,
            )
        }
    }
}
