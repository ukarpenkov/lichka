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
    val chatId = intent.getStringExtra(AlarmScheduler.EXTRA_CHAT_ID)
    if (chatId != null) {
      val messageId = intent.getStringExtra(AlarmScheduler.EXTRA_MESSAGE_ID)
      val reactHost = (application as MainApplication).reactHost
      val reactContext = reactHost?.currentReactContext
      if (reactContext != null) {
        val module =
            reactContext.getNativeModule(NotificationModule::class.java) as? NotificationModule
        module?.emitNotificationOpen(chatId, messageId)
      }
    }
  }
}
