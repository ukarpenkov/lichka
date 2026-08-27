package com.lichka

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Prevents crash "Screen fragments should never be restored" from react-native-screens.
   * When Android kills the app process in background and tries to restore fragments,
   * RNScreens throws IllegalStateException. Passing null to super.onCreate() skips restoration.
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    NotificationModule.captureNotificationOpen(intent)
    WidgetModule.captureWidgetOpen(intent)
    IncomingShareModule.captureShare(this, intent)
    ShortcutModule.captureShortcutOpen(intent)
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "lichka"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    NotificationModule.captureNotificationOpen(intent)
    WidgetModule.captureWidgetOpen(intent)
    IncomingShareModule.captureShare(this, intent)
    ShortcutModule.captureShortcutOpen(intent)
    val reactHost = (application as MainApplication).reactHost
    val reactContext = reactHost?.currentReactContext

    val chatId = intent.getStringExtra(AlarmScheduler.EXTRA_CHAT_ID)
    if (chatId != null) {
      val messageId = intent.getStringExtra(AlarmScheduler.EXTRA_MESSAGE_ID)
      if (reactContext != null) {
        val module =
            reactContext.getNativeModule(NotificationModule::class.java) as? NotificationModule
        module?.emitNotificationOpen(chatId, messageId)
      }
    }

    val openTarget = intent.getStringExtra(WidgetModule.EXTRA_OPEN_TARGET)
    if (openTarget != null) {
      val messageId = intent.getStringExtra(WidgetModule.EXTRA_MESSAGE_ID)
      if (reactContext != null) {
        val module =
            reactContext.getNativeModule(WidgetModule::class.java) as? WidgetModule
        module?.emitWidgetOpen(openTarget, messageId)
      }
    }

    if (intent.action == Intent.ACTION_SEND) {
      IncomingShareModule.emitPendingIfPossible()
    }

    val shortcutId = intent.getStringExtra(ShortcutModule.EXTRA_SHORTCUT_ID)
    if (shortcutId != null && reactContext != null) {
      val module =
          reactContext.getNativeModule(ShortcutModule::class.java) as? ShortcutModule
      module?.emitShortcutOpen(shortcutId)
    }
  }
}
