package com.lichka

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class NotificationModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = NAME

    override fun initialize() {
        super.initialize()
        registerChannels(reactApplicationContext)
    }

    @ReactMethod
    fun registerChannels() {
        registerChannels(reactApplicationContext)
    }

    private fun registerChannels(context: Context) {
        val manager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val reminders =
            NotificationChannel(
                CHANNEL_REMINDERS,
                "Reminders",
                NotificationManager.IMPORTANCE_DEFAULT,
            ).apply {
                description = "Scheduled reminders"
            }

        val alarms =
            NotificationChannel(
                CHANNEL_ALARMS,
                "Alarms",
                NotificationManager.IMPORTANCE_HIGH,
            ).apply {
                description = "Full-screen alarms"
                setBypassDnd(true)
            }

        manager.createNotificationChannel(reminders)
        manager.createNotificationChannel(alarms)
    }

    companion object {
        const val NAME = "NotificationModule"
        const val CHANNEL_REMINDERS = "reminders"
        const val CHANNEL_ALARMS = "alarms"
    }
}
