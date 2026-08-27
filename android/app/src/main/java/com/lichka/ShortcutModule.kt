package com.lichka

import android.content.Intent
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.modules.core.DeviceEventManagerModule

class ShortcutModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = NAME

    @ReactMethod
    fun getInitialShortcutId(promise: Promise) {
        if (openConsumed) {
            promise.resolve(null)
            return
        }
        val shortcutId =
            pendingShortcutId
                ?: reactApplicationContext.currentActivity
                    ?.intent
                    ?.getStringExtra(EXTRA_SHORTCUT_ID)
        promise.resolve(shortcutId)
    }

    @ReactMethod
    fun consumeInitialShortcut() {
        markShortcutConsumed()
        stripShortcutExtraFromActivity()
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for NativeEventEmitter
    }

    fun emitShortcutOpen(shortcutId: String) {
        val reactContext = reactApplicationContext
        if (!reactContext.hasActiveReactInstance()) {
            return
        }
        val payload =
            Arguments.createMap().apply {
                putString("shortcutId", shortcutId)
            }
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EVENT_SHORTCUT_OPEN, payload)
        consumeInitialShortcut()
    }

    private fun stripShortcutExtraFromActivity() {
        val activity = reactApplicationContext.currentActivity ?: return
        val apply =
            Runnable {
                val intent = activity.intent ?: return@Runnable
                if (!intent.hasExtra(EXTRA_SHORTCUT_ID)) {
                    return@Runnable
                }
                val cleaned = Intent(intent)
                cleaned.removeExtra(EXTRA_SHORTCUT_ID)
                activity.intent = cleaned
            }
        if (UiThreadUtil.isOnUiThread()) {
            apply.run()
        } else {
            UiThreadUtil.runOnUiThread(apply)
        }
    }

    companion object {
        const val NAME = "ShortcutModule"
        const val EXTRA_SHORTCUT_ID = "shortcutId"
        const val SHORTCUT_WRITE_SAVED = "write_saved"
        const val EVENT_SHORTCUT_OPEN = "onShortcutOpen"

        @Volatile
        private var pendingShortcutId: String? = null

        @Volatile
        private var openConsumed = false

        @JvmStatic
        fun captureShortcutOpen(intent: Intent?) {
            if (intent == null) return
            val shortcutId = intent.getStringExtra(EXTRA_SHORTCUT_ID) ?: return
            pendingShortcutId = shortcutId
            openConsumed = false
        }

        @JvmStatic
        fun markShortcutConsumed() {
            openConsumed = true
            pendingShortcutId = null
        }
    }
}
