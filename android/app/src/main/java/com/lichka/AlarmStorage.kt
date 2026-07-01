package com.lichka

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

/**
 * Хранилище активных уведомлений в SharedPreferences.
 * Используется для восстановления будильников после перезагрузки устройства.
 */
object AlarmStorage {

    private const val PREFS_NAME = "alarm_storage"
    private const val KEY_ALARMS = "alarms"

    data class SavedAlarm(
        val messageId: String,
        val chatId: String,
        val body: String,
        val chatTitle: String,
        val intervalMinutes: Int,
        val triggerAtMillis: Long,
        val isAlarm: Boolean = false,
    )

    fun save(
        context: Context,
        messageId: String,
        chatId: String,
        body: String,
        chatTitle: String,
        intervalMinutes: Int,
        triggerAtMillis: Long,
        isAlarm: Boolean = false,
    ) {
        val prefs = getPrefs(context)
        val alarms = loadAll(context).toMutableList()

        // Удаляем старую запись с таким же messageId
        alarms.removeAll { it.messageId == messageId }
        alarms.add(
            SavedAlarm(messageId, chatId, body, chatTitle, intervalMinutes, triggerAtMillis, isAlarm)
        )

        prefs.edit().putString(KEY_ALARMS, toJsonArray(alarms).toString()).apply()
    }

    fun remove(context: Context, messageId: String) {
        val prefs = getPrefs(context)
        val alarms = loadAll(context).toMutableList()
        alarms.removeAll { it.messageId == messageId }
        prefs.edit().putString(KEY_ALARMS, toJsonArray(alarms).toString()).apply()
    }

    fun loadAll(context: Context): List<SavedAlarm> {
        val json = getPrefs(context).getString(KEY_ALARMS, null) ?: return emptyList()
        return try {
            fromJsonArray(JSONArray(json))
        } catch (_: Exception) {
            emptyList()
        }
    }

    private fun getPrefs(context: Context): SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private fun toJsonArray(alarms: List<SavedAlarm>): JSONArray {
        val array = JSONArray()
        for (alarm in alarms) {
            array.put(
                JSONObject().apply {
                    put("messageId", alarm.messageId)
                    put("chatId", alarm.chatId)
                    put("body", alarm.body)
                    put("chatTitle", alarm.chatTitle)
                    put("intervalMinutes", alarm.intervalMinutes)
                    put("triggerAtMillis", alarm.triggerAtMillis)
                    put("isAlarm", alarm.isAlarm)
                }
            )
        }
        return array
    }

    private fun fromJsonArray(array: JSONArray): List<SavedAlarm> {
        val result = mutableListOf<SavedAlarm>()
        for (i in 0 until array.length()) {
            val obj = array.getJSONObject(i)
            result.add(
                SavedAlarm(
                    messageId = obj.getString("messageId"),
                    chatId = obj.getString("chatId"),
                    body = obj.getString("body"),
                    chatTitle = obj.getString("chatTitle"),
                    intervalMinutes = obj.getInt("intervalMinutes"),
                    triggerAtMillis = obj.getLong("triggerAtMillis"),
                    isAlarm = obj.optBoolean("isAlarm", false),
                )
            )
        }
        return result
    }
}
