package com.lichka

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Восстанавливает запланированные уведомления после перезагрузки устройства.
 * Все AlarmManager-будильники сбрасываются при reboot — этот ресивер их восстанавливает.
 */
class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return

        // Каналы уведомлений персистентны, но на всякий случай пересоздаём
        ensureChannels(context)

        // Восстанавливаем все запланированные уведомления
        AlarmScheduler.rescheduleAll(context)
    }

    private fun ensureChannels(context: Context) {
        val manager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val reminders =
            NotificationChannel(
                NotificationModule.CHANNEL_REMINDERS,
                "Reminders",
                NotificationManager.IMPORTANCE_DEFAULT,
            ).apply {
                description = "Scheduled reminders"
            }

        val alarms =
            NotificationChannel(
                NotificationModule.CHANNEL_ALARMS,
                "Alarms",
                NotificationManager.IMPORTANCE_HIGH,
            ).apply {
                description = "Full-screen alarms"
                setBypassDnd(true)
            }

        manager.createNotificationChannel(reminders)
        manager.createNotificationChannel(alarms)
    }
}
