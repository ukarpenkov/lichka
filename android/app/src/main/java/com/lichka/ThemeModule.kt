package com.lichka

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ThemeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = NAME

    @ReactMethod
    fun setTheme(background: String, text: String) {
        // commit() — синхронно: иначе refreshAll может прочитать старые цвета
        // (фон/бордер/title остаются от прошлой темы, а list уже берёт новые).
        reactApplicationContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_BACKGROUND, background)
            .putString(KEY_TEXT, text)
            .commit()
        ScheduledWidgetProvider.refreshAll(reactApplicationContext)
    }

    companion object {
        const val NAME = "ThemeModule"
        private const val PREFS_NAME = "lichka_theme"
        private const val KEY_BACKGROUND = "background"
        private const val KEY_TEXT = "text"
        private const val DEFAULT_BACKGROUND = "#000000"
        private const val DEFAULT_TEXT = "#39FF14"

        fun getBackground(context: Context): String =
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .getString(KEY_BACKGROUND, DEFAULT_BACKGROUND) ?: DEFAULT_BACKGROUND

        fun getText(context: Context): String =
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .getString(KEY_TEXT, DEFAULT_TEXT) ?: DEFAULT_TEXT
    }
}
