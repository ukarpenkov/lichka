package com.lichka

import android.app.Notification
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat

object NotificationHelper {

    private const val ACTION_SNOOZE = "com.lichka.ACTION_SNOOZE"
    private const val SNOOZE_MINUTES = 5

    fun buildReminderNotification(
        context: Context,
        body: String,
        chatTitle: String,
        chatId: String,
        messageId: String,
        intervalMinutes: Int,
    ): Notification {
        val contentIntent =
            Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra(AlarmScheduler.EXTRA_CHAT_ID, chatId)
            }
        val contentPendingIntent =
            PendingIntent.getActivity(
                context,
                messageId.hashCode(),
                contentIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )

        val snoozeIntent =
            Intent(context, AlarmReceiver::class.java).apply {
                action = ACTION_SNOOZE
                putExtra(AlarmScheduler.EXTRA_MESSAGE_ID, messageId)
                putExtra(AlarmScheduler.EXTRA_CHAT_ID, chatId)
                putExtra(AlarmScheduler.EXTRA_BODY, body)
                putExtra(AlarmScheduler.EXTRA_CHAT_TITLE, chatTitle)
                putExtra(AlarmScheduler.EXTRA_INTERVAL_MINUTES, intervalMinutes)
            }
        val snoozePendingIntent =
            PendingIntent.getBroadcast(
                context,
                messageId.hashCode() + 1,
                snoozeIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        val snoozeAction =
            NotificationCompat.Action.Builder(
                    android.R.drawable.ic_lock_idle_alarm,
                    "Snooze ($SNOOZE_MINUTES мин)",
                    snoozePendingIntent,
                )
                .build()

        return NotificationCompat.Builder(context, NotificationModule.CHANNEL_REMINDERS)
            .setSmallIcon(R.drawable.ic_stat_notification)
            .setContentTitle(chatTitle)
            .setContentText(body)
            .setAutoCancel(true)
            .setContentIntent(contentPendingIntent)
            .addAction(snoozeAction)
            .build()
    }

    fun snoozeMinutes(): Int = SNOOZE_MINUTES

    const val snoozeAction: String = ACTION_SNOOZE
}
