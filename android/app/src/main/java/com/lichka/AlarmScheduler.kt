package com.lichka

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build

object AlarmScheduler {

    const val EXTRA_MESSAGE_ID = "messageId"
    const val EXTRA_CHAT_ID = "chatId"
    const val EXTRA_BODY = "body"
    const val EXTRA_CHAT_TITLE = "chatTitle"
    const val EXTRA_INTERVAL_MINUTES = "intervalMinutes"
    const val EXTRA_IS_ALARM = "isAlarm"

    fun scheduleReminder(
        context: Context,
        messageId: String,
        chatId: String,
        body: String,
        chatTitle: String,
        triggerAtMillis: Long,
    ) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val pendingIntent = buildPendingIntent(context, messageId, chatId, body, chatTitle, 0)
        alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
    }

    fun schedulePeriodicFirst(
        context: Context,
        messageId: String,
        chatId: String,
        body: String,
        chatTitle: String,
        intervalMinutes: Int,
        triggerAtMillis: Long,
    ) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val pendingIntent =
            buildPendingIntent(context, messageId, chatId, body, chatTitle, intervalMinutes)
        alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
    }

    fun scheduleAlarm(
        context: Context,
        messageId: String,
        chatId: String,
        body: String,
        chatTitle: String,
        triggerAtMillis: Long,
    ) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val pendingIntent = buildAlarmPendingIntent(context, messageId, chatId, body, chatTitle)

        val showIntent = Intent(context, MainActivity::class.java).let { intent ->
            PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_IMMUTABLE,
            )
        }
        val alarmClockInfo = AlarmManager.AlarmClockInfo(triggerAtMillis, showIntent)
        alarmManager.setAlarmClock(alarmClockInfo, pendingIntent)
    }

    fun cancelAlarm(context: Context, messageId: String) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, AlarmReceiver::class.java).apply {
            putExtra(EXTRA_IS_ALARM, true)
        }
        val pendingIntent =
            PendingIntent.getBroadcast(
                context,
                messageId.hashCode(),
                intent,
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE,
            )
        pendingIntent?.let { alarmManager.cancel(it) }
    }

    fun cancel(context: Context, messageId: String) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, AlarmReceiver::class.java)
        val pendingIntent =
            PendingIntent.getBroadcast(
                context,
                messageId.hashCode(),
                intent,
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE,
            )
        pendingIntent?.let { alarmManager.cancel(it) }
    }

    private fun buildPendingIntent(
        context: Context,
        messageId: String,
        chatId: String,
        body: String,
        chatTitle: String,
        intervalMinutes: Int,
    ): PendingIntent {
        val intent =
            Intent(context, AlarmReceiver::class.java).apply {
                putExtra(EXTRA_MESSAGE_ID, messageId)
                putExtra(EXTRA_CHAT_ID, chatId)
                putExtra(EXTRA_BODY, body)
                putExtra(EXTRA_CHAT_TITLE, chatTitle)
                putExtra(EXTRA_INTERVAL_MINUTES, intervalMinutes)
            }
        return PendingIntent.getBroadcast(
            context,
            messageId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    private fun buildAlarmPendingIntent(
        context: Context,
        messageId: String,
        chatId: String,
        body: String,
        chatTitle: String,
    ): PendingIntent {
        val intent =
            Intent(context, AlarmReceiver::class.java).apply {
                putExtra(EXTRA_MESSAGE_ID, messageId)
                putExtra(EXTRA_CHAT_ID, chatId)
                putExtra(EXTRA_BODY, body)
                putExtra(EXTRA_CHAT_TITLE, chatTitle)
                putExtra(EXTRA_IS_ALARM, true)
            }
        return PendingIntent.getBroadcast(
            context,
            messageId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }
}
