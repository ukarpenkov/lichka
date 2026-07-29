package com.lichka

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

/**
 * Snapshot ближайших запланированных сообщений для home screen виджета.
 * Пишется из JS; читается ScheduledWidgetProvider.
 */
object ScheduledWidgetStorage {

    private const val PREFS_NAME = "scheduled_widget_storage"
    private const val KEY_ITEMS = "items"

    data class Item(
        val messageId: String,
        val chatId: String,
        val type: String,
        val body: String,
        val chatTitle: String,
        val scheduledAtMillis: Long,
    )

    fun save(context: Context, items: List<Item>) {
        getPrefs(context).edit().putString(KEY_ITEMS, toJsonArray(items).toString()).apply()
    }

    fun saveJson(context: Context, json: String) {
        getPrefs(context).edit().putString(KEY_ITEMS, json).apply()
    }

    fun loadAll(context: Context): List<Item> {
        val json = getPrefs(context).getString(KEY_ITEMS, null) ?: return emptyList()
        return try {
            fromJsonArray(JSONArray(json))
        } catch (_: Exception) {
            emptyList()
        }
    }

    private fun getPrefs(context: Context): SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private fun toJsonArray(items: List<Item>): JSONArray {
        val array = JSONArray()
        for (item in items) {
            array.put(
                JSONObject().apply {
                    put("messageId", item.messageId)
                    put("chatId", item.chatId)
                    put("type", item.type)
                    put("body", item.body)
                    put("chatTitle", item.chatTitle)
                    put("scheduledAt", item.scheduledAtMillis)
                },
            )
        }
        return array
    }

    private fun fromJsonArray(array: JSONArray): List<Item> {
        val result = mutableListOf<Item>()
        for (i in 0 until array.length()) {
            val obj = array.getJSONObject(i)
            result.add(
                Item(
                    messageId = obj.getString("messageId"),
                    chatId = obj.optString("chatId", ""),
                    type = obj.optString("type", "reminder"),
                    body = obj.optString("body", ""),
                    chatTitle = obj.optString("chatTitle", ""),
                    scheduledAtMillis = obj.optLong("scheduledAt", 0L),
                ),
            )
        }
        return result
    }
}
