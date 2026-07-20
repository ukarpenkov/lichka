package com.lichka

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Arguments
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
    fun scheduleAlarm(
        messageId: String,
        chatId: String,
        body: String,
        chatTitle: String,
        triggerAtMillis: Double,
    ) {
        AlarmScheduler.scheduleAlarm(
            reactApplicationContext, messageId, chatId, body, chatTitle, triggerAtMillis.toLong(),
        )
    }

    @ReactMethod
    fun canScheduleExactAlarms(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val alarmManager =
                reactApplicationContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            promise.resolve(alarmManager.canScheduleExactAlarms())
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun requestScheduleExactAlarm() {
        // На Android 13+ USE_EXACT_ALARM выдаётся автоматически.
        // На Android 12 нужно запросить SCHEDULE_EXACT_ALARM вручную.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
            Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU
        ) {
            val intent =
                Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                    data = Uri.parse("package:${reactApplicationContext.packageName}")
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
            reactApplicationContext.startActivity(intent)
        }
    }

    @ReactMethod
    fun requestIgnoreBatteryOptimizations() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent =
                Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:${reactApplicationContext.packageName}")
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
            reactApplicationContext.startActivity(intent)
        }
    }

    @ReactMethod
    fun getInitialChatId(promise: Promise) {
        val chatId =
            pendingOpenChatId
                ?: reactApplicationContext.currentActivity
                    ?.intent
                    ?.getStringExtra(AlarmScheduler.EXTRA_CHAT_ID)
        promise.resolve(chatId)
    }

    @ReactMethod
    fun getInitialMessageId(promise: Promise) {
        val messageId =
            if (pendingOpenChatId != null) {
                pendingOpenMessageId
            } else {
                reactApplicationContext.currentActivity
                    ?.intent
                    ?.getStringExtra(AlarmScheduler.EXTRA_MESSAGE_ID)
            }
        promise.resolve(messageId)
    }

    @ReactMethod
    fun consumeInitialChatId() {
        clearPendingOpen()
        reactApplicationContext.currentActivity?.intent?.removeExtra(AlarmScheduler.EXTRA_CHAT_ID)
        reactApplicationContext.currentActivity?.intent?.removeExtra(AlarmScheduler.EXTRA_MESSAGE_ID)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for NativeEventEmitter
    }

    fun emitNotificationOpen(chatId: String, messageId: String?) {
        val reactContext = reactApplicationContext
        if (!reactContext.hasActiveReactInstance()) {
            return
        }
        // WritableMap only — HashMap/MutableMap throws in Arguments.fromJavaArgs
        // and the warm-start tap never reaches JS.
        val payload =
            Arguments.createMap().apply {
                putString("chatId", chatId)
                if (messageId != null) {
                    putString("messageId", messageId)
                }
            }
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("onNotificationOpen", payload)
        // Delivered via event — don't leave pending for a later cold-start read.
        clearPendingOpen()
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

        @Volatile
        private var pendingOpenChatId: String? = null

        @Volatile
        private var pendingOpenMessageId: String? = null

        /** Сохраняет extras из intent до готовности JS (cold start). */
        @JvmStatic
        fun captureNotificationOpen(intent: Intent?) {
            if (intent == null || !intent.hasExtra(AlarmScheduler.EXTRA_CHAT_ID)) {
                return
            }
            pendingOpenChatId = intent.getStringExtra(AlarmScheduler.EXTRA_CHAT_ID)
            pendingOpenMessageId = intent.getStringExtra(AlarmScheduler.EXTRA_MESSAGE_ID)
        }

        @JvmStatic
        fun clearPendingOpen() {
            pendingOpenChatId = null
            pendingOpenMessageId = null
        }
    }
}
