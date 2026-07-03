package com.lichka

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent

object AlarmScheduler {

    const val EXTRA_MESSAGE_ID = "messageId"
    const val EXTRA_CHAT_ID = "chatId"
    const val EXTRA_BODY = "body"
    const val EXTRA_CHAT_TITLE = "chatTitle"
    const val EXTRA_INTERVAL_MINUTES = "intervalMinutes"
    const val EXTRA_IS_ALARM = "isAlarm"
    const val EXTRA_TRIGGER_TIME = "triggerTime"

    fun scheduleReminder(
        context: Context,
        messageId: String,
        chatId: String,
        body: String,
        chatTitle: String,
        triggerAtMillis: Long,
    ) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val pendingIntent = buildPendingIntent(context, messageId, chatId, body, chatTitle, 0, triggerAtMillis, false)
        val showIntent = Intent(context, MainActivity::class.java).let { intent ->
            PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE)
        }
        val alarmClockInfo = AlarmManager.AlarmClockInfo(triggerAtMillis, showIntent)
        alarmManager.setAlarmClock(alarmClockInfo, pendingIntent)
        AlarmStorage.save(context, messageId, chatId, body, chatTitle, 0, triggerAtMillis)
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
            buildPendingIntent(context, messageId, chatId, body, chatTitle, intervalMinutes, triggerAtMillis, false)
        val showIntent = Intent(context, MainActivity::class.java).let { intent ->
            PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE)
        }
        val alarmClockInfo = AlarmManager.AlarmClockInfo(triggerAtMillis, showIntent)
        alarmManager.setAlarmClock(alarmClockInfo, pendingIntent)
        AlarmStorage.save(
            context, messageId, chatId, body, chatTitle, intervalMinutes, triggerAtMillis,
        )
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
        val pendingIntent = buildPendingIntent(context, messageId, chatId, body, chatTitle, 0, triggerAtMillis, true)

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
        AlarmStorage.save(context, messageId, chatId, body, chatTitle, 0, triggerAtMillis, isAlarm = true)
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
        AlarmStorage.remove(context, messageId)
    }

    fun rescheduleAll(context: Context) {
        val alarms = AlarmStorage.loadAll(context)
        val now = System.currentTimeMillis()
        for (alarm in alarms) {
            if (alarm.triggerAtMillis <= now) {
                // Просрочен — удаляем
                AlarmStorage.remove(context, alarm.messageId)
                continue
            }
            if (alarm.isAlarm) {
                scheduleAlarm(
                    context, alarm.messageId, alarm.chatId, alarm.body, alarm.chatTitle,
                    alarm.triggerAtMillis,
                )
            } else if (alarm.intervalMinutes > 0) {
                schedulePeriodicFirst(
                    context, alarm.messageId, alarm.chatId, alarm.body, alarm.chatTitle,
                    alarm.intervalMinutes, alarm.triggerAtMillis,
                )
            } else {
                scheduleReminder(
                    context, alarm.messageId, alarm.chatId, alarm.body, alarm.chatTitle,
                    alarm.triggerAtMillis,
                )
            }
        }
    }

    private fun buildPendingIntent(
        context: Context,
        messageId: String,
        chatId: String,
        body: String,
        chatTitle: String,
        intervalMinutes: Int,
        triggerAtMillis: Long,
        isAlarm: Boolean = false,
    ): PendingIntent {
        val intent =
            Intent(context, AlarmReceiver::class.java).apply {
                putExtra(EXTRA_MESSAGE_ID, messageId)
                putExtra(EXTRA_CHAT_ID, chatId)
                putExtra(EXTRA_BODY, body)
                putExtra(EXTRA_CHAT_TITLE, chatTitle)
                putExtra(EXTRA_INTERVAL_MINUTES, intervalMinutes)
                putExtra(EXTRA_IS_ALARM, isAlarm)
                putExtra(EXTRA_TRIGGER_TIME, triggerAtMillis)
            }
        return PendingIntent.getBroadcast(
            context,
            messageId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }
}
