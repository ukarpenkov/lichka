package com.lichka

import android.content.Intent
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
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
        val target =
            pendingOpenTarget
                ?: reactApplicationContext.currentActivity
                    ?.intent
                    ?.getStringExtra(EXTRA_OPEN_TARGET)
        promise.resolve(target)
    }

    @ReactMethod
    fun getInitialWidgetMessageId(promise: Promise) {
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
        clearPendingOpen()
        reactApplicationContext.currentActivity?.intent?.removeExtra(EXTRA_OPEN_TARGET)
        reactApplicationContext.currentActivity?.intent?.removeExtra(EXTRA_MESSAGE_ID)
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
        clearPendingOpen()
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

        @JvmStatic
        fun captureWidgetOpen(intent: Intent?) {
            if (intent == null) return
            val target = intent.getStringExtra(EXTRA_OPEN_TARGET) ?: return
            pendingOpenTarget = target
            pendingOpenMessageId = intent.getStringExtra(EXTRA_MESSAGE_ID)
        }

        @JvmStatic
        fun clearPendingOpen() {
            pendingOpenTarget = null
            pendingOpenMessageId = null
        }
    }
}
