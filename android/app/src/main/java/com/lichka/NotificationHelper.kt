package com.lichka

import android.app.Notification
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.drawable.Drawable
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.core.graphics.drawable.toBitmap

object NotificationHelper {

    private const val ACTION_SNOOZE = "com.lichka.ACTION_SNOOZE"
    private const val ACTION_MARK_READ = "com.lichka.ACTION_MARK_READ"
    private const val SNOOZE_MINUTES = 15

    fun buildAlarmNotification(
        context: Context,
        body: String,
        chatTitle: String,
        chatId: String,
        messageId: String,
        triggerTime: Long,
    ): Notification {
        val alarmIntent =
            Intent(context, AlarmActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra(AlarmScheduler.EXTRA_MESSAGE_ID, messageId)
                putExtra(AlarmScheduler.EXTRA_CHAT_ID, chatId)
                putExtra(AlarmScheduler.EXTRA_BODY, body)
                putExtra(AlarmScheduler.EXTRA_CHAT_TITLE, chatTitle)
                putExtra(AlarmScheduler.EXTRA_TRIGGER_TIME, triggerTime)
            }
        val alarmPendingIntent =
            PendingIntent.getActivity(
                context,
                messageId.hashCode(),
                alarmIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )

        val snoozeAction = buildSnoozeAction(
            context,
            messageId,
            chatId,
            body,
            chatTitle,
            intervalMinutes = 0,
            isAlarm = true,
            triggerTime = triggerTime,
        )
        val markReadAction = buildMarkReadAction(
            context,
            messageId,
            chatId,
            body,
            chatTitle,
            intervalMinutes = 0,
            isAlarm = true,
            triggerTime = triggerTime,
        )

        return NotificationCompat.Builder(context, NotificationModule.CHANNEL_ALARMS)
            .setSmallIcon(R.drawable.ic_stat_notification)
            .setLargeIcon(appLargeIcon(context))
            .setContentTitle(chatTitle)
            .setContentText(body)
            .setOngoing(true)
            .setAutoCancel(false)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setFullScreenIntent(alarmPendingIntent, true)
            .setContentIntent(alarmPendingIntent)
            .addAction(markReadAction)
            .addAction(snoozeAction)
            .build()
    }

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
                putExtra(AlarmScheduler.EXTRA_MESSAGE_ID, messageId)
            }
        val contentPendingIntent =
            PendingIntent.getActivity(
                context,
                messageId.hashCode(),
                contentIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )

        val snoozeAction = buildSnoozeAction(
            context,
            messageId,
            chatId,
            body,
            chatTitle,
            intervalMinutes = intervalMinutes,
            isAlarm = false,
            triggerTime = 0,
        )
        val markReadAction = buildMarkReadAction(
            context,
            messageId,
            chatId,
            body,
            chatTitle,
            intervalMinutes = intervalMinutes,
            isAlarm = false,
            triggerTime = 0,
        )

        return NotificationCompat.Builder(context, NotificationModule.CHANNEL_REMINDERS)
            .setSmallIcon(R.drawable.ic_stat_notification)
            .setLargeIcon(appLargeIcon(context))
            .setContentTitle(chatTitle)
            .setContentText(body)
            .setAutoCancel(true)
            .setContentIntent(contentPendingIntent)
            .addAction(markReadAction)
            .addAction(snoozeAction)
            .build()
    }

    /** Fixed-size bitmap: adaptive mipmaps report intrinsic -1 and used to become 1×1. */
    private fun appLargeIcon(context: Context): Bitmap {
        val width =
            context.resources.getDimensionPixelSize(android.R.dimen.notification_large_icon_width)
        val height =
            context.resources.getDimensionPixelSize(android.R.dimen.notification_large_icon_height)
        return appIconDrawable(context).toBitmap(width, height)
    }

    private fun appIconDrawable(context: Context): Drawable {
        return ContextCompat.getDrawable(context, R.mipmap.ic_launcher_round)
            ?: ContextCompat.getDrawable(context, R.mipmap.ic_launcher)
            ?: context.packageManager.getApplicationIcon(context.applicationInfo)
    }

    private fun buildSnoozeAction(
        context: Context,
        messageId: String,
        chatId: String,
        body: String,
        chatTitle: String,
        intervalMinutes: Int,
        isAlarm: Boolean,
        triggerTime: Long,
    ): NotificationCompat.Action {
        val snoozeIntent =
            Intent(context, AlarmReceiver::class.java).apply {
                action = ACTION_SNOOZE
                putExtra(AlarmScheduler.EXTRA_MESSAGE_ID, messageId)
                putExtra(AlarmScheduler.EXTRA_CHAT_ID, chatId)
                putExtra(AlarmScheduler.EXTRA_BODY, body)
                putExtra(AlarmScheduler.EXTRA_CHAT_TITLE, chatTitle)
                putExtra(AlarmScheduler.EXTRA_INTERVAL_MINUTES, intervalMinutes)
                putExtra(AlarmScheduler.EXTRA_IS_ALARM, isAlarm)
                putExtra(AlarmScheduler.EXTRA_TRIGGER_TIME, triggerTime)
            }
        val snoozePendingIntent =
            PendingIntent.getBroadcast(
                context,
                messageId.hashCode() + 1,
                snoozeIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        return NotificationCompat.Action.Builder(
                android.R.drawable.ic_lock_idle_alarm,
                "Snooze ($SNOOZE_MINUTES мин)",
                snoozePendingIntent,
            )
            .build()
    }

    private fun buildMarkReadAction(
        context: Context,
        messageId: String,
        chatId: String,
        body: String,
        chatTitle: String,
        intervalMinutes: Int,
        isAlarm: Boolean,
        triggerTime: Long,
    ): NotificationCompat.Action {
        val markReadIntent =
            Intent(context, AlarmReceiver::class.java).apply {
                action = ACTION_MARK_READ
                putExtra(AlarmScheduler.EXTRA_MESSAGE_ID, messageId)
                putExtra(AlarmScheduler.EXTRA_CHAT_ID, chatId)
                putExtra(AlarmScheduler.EXTRA_BODY, body)
                putExtra(AlarmScheduler.EXTRA_CHAT_TITLE, chatTitle)
                putExtra(AlarmScheduler.EXTRA_INTERVAL_MINUTES, intervalMinutes)
                putExtra(AlarmScheduler.EXTRA_IS_ALARM, isAlarm)
                putExtra(AlarmScheduler.EXTRA_TRIGGER_TIME, triggerTime)
            }
        val markReadPendingIntent =
            PendingIntent.getBroadcast(
                context,
                messageId.hashCode() + 2,
                markReadIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        return NotificationCompat.Action.Builder(
                android.R.drawable.ic_menu_close_clear_cancel,
                "Прочитано",
                markReadPendingIntent,
            )
            .build()
    }

    fun snoozeMinutes(): Int = SNOOZE_MINUTES

    const val snoozeAction: String = ACTION_SNOOZE
    const val markReadAction: String = ACTION_MARK_READ
}
