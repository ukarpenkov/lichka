package com.lichka

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

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

    @ReactMethod
    fun scheduleReminder(
        messageId: String,
        chatId: String,
        body: String,
        chatTitle: String,
        triggerAtMillis: Double,
    ) {
        AlarmScheduler.scheduleReminder(
            reactApplicationContext, messageId, chatId, body, chatTitle, triggerAtMillis.toLong(),
        )
    }

    @ReactMethod
    fun schedulePeriodic(
        messageId: String,
        chatId: String,
        body: String,
        chatTitle: String,
        intervalMinutes: Int,
        triggerAtMillis: Double,
    ) {
        AlarmScheduler.schedulePeriodicFirst(
            reactApplicationContext,
            messageId,
            chatId,
            body,
            chatTitle,
            intervalMinutes,
            triggerAtMillis.toLong(),
        )
    }

    @ReactMethod
    fun cancelAlarm(messageId: String) {
        AlarmScheduler.cancel(reactApplicationContext, messageId)
    }

    @ReactMethod
    fun getInitialChatId(promise: Promise) {
        val chatId = currentActivity?.intent?.getStringExtra(AlarmScheduler.EXTRA_CHAT_ID)
        promise.resolve(chatId)
    }

    @ReactMethod
    fun consumeInitialChatId() {
        currentActivity?.intent?.removeExtra(AlarmScheduler.EXTRA_CHAT_ID)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for NativeEventEmitter
    }

    fun emitNotificationOpen(chatId: String) {
        val reactContext = reactApplicationContext
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onNotificationOpen", mapOf("chatId" to chatId))
        }
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
