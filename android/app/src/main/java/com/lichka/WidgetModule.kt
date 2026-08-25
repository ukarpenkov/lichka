package com.lichka

import android.content.Intent
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.modules.core.DeviceEventManagerModule

class WidgetModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = NAME

    @ReactMethod
    fun updateScheduledWidgetSnapshot(json: String) {
        val context = reactApplicationContext
        ScheduledWidgetStorage.saveJson(context, json)
        ScheduledWidgetProvider.refreshAll(context)
    }

    @ReactMethod
    fun setWidgetLocaleStrings(emptyText: String, untitledText: String) {
        val context = reactApplicationContext
        ScheduledWidgetStorage.saveLocaleStrings(context, emptyText, untitledText)
        ScheduledWidgetProvider.refreshAll(context)
    }

    @ReactMethod
    fun getInitialOpenTarget(promise: Promise) {
        if (openConsumed) {
            promise.resolve(null)
            return
        }
        val target =
            pendingOpenTarget
                ?: reactApplicationContext.currentActivity
                    ?.intent
                    ?.getStringExtra(EXTRA_OPEN_TARGET)
        promise.resolve(target)
    }

    @ReactMethod
    fun getInitialWidgetMessageId(promise: Promise) {
        if (openConsumed) {
            promise.resolve(null)
            return
        }
        val messageId =
            if (pendingOpenTarget != null) {
                pendingOpenMessageId
            } else {
                reactApplicationContext.currentActivity
                    ?.intent
                    ?.getStringExtra(EXTRA_MESSAGE_ID)
            }
        promise.resolve(messageId)
    }

    @ReactMethod
    fun consumeInitialWidgetOpen() {
        markWidgetOpenConsumed()
        stripWidgetOpenExtrasFromActivity()
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for NativeEventEmitter
    }

    fun emitWidgetOpen(openTarget: String, messageId: String?) {
        val reactContext = reactApplicationContext
        if (!reactContext.hasActiveReactInstance()) {
            return
        }
        val payload =
            Arguments.createMap().apply {
                putString("openTarget", openTarget)
                if (messageId != null) {
                    putString("messageId", messageId)
                }
            }
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("onWidgetOpen", payload)
        // Same consume as JS: pending + extras must not survive for a late getInitial*.
        consumeInitialWidgetOpen()
    }

    private fun stripWidgetOpenExtrasFromActivity() {
        val activity = reactApplicationContext.currentActivity ?: return
        val apply =
            Runnable {
                val intent = activity.intent ?: return@Runnable
                if (!intent.hasExtra(EXTRA_OPEN_TARGET) && !intent.hasExtra(EXTRA_MESSAGE_ID)) {
                    return@Runnable
                }
                // removeExtra in-place is unreliable; replace the Activity intent.
                val cleaned = Intent(intent)
                cleaned.removeExtra(EXTRA_OPEN_TARGET)
                cleaned.removeExtra(EXTRA_MESSAGE_ID)
                activity.intent = cleaned
            }
        if (UiThreadUtil.isOnUiThread()) {
            apply.run()
        } else {
            UiThreadUtil.runOnUiThread(apply)
        }
    }

    companion object {
        const val NAME = "WidgetModule"
        const val EXTRA_OPEN_TARGET = "openTarget"
        const val EXTRA_MESSAGE_ID = "messageId"
        const val OPEN_TARGET_SCHEDULED = "scheduled"

        @Volatile
        private var pendingOpenTarget: String? = null

        @Volatile
        private var pendingOpenMessageId: String? = null

        @Volatile
        private var openConsumed = false

        @JvmStatic
        fun captureWidgetOpen(intent: Intent?) {
            if (intent == null) return
            val target = intent.getStringExtra(EXTRA_OPEN_TARGET) ?: return
            pendingOpenTarget = target
            pendingOpenMessageId = intent.getStringExtra(EXTRA_MESSAGE_ID)
            openConsumed = false
        }

        @JvmStatic
        fun markWidgetOpenConsumed() {
            openConsumed = true
            pendingOpenTarget = null
            pendingOpenMessageId = null
        }

        @JvmStatic
        fun clearPendingOpen() {
            markWidgetOpenConsumed()
        }
    }
}
