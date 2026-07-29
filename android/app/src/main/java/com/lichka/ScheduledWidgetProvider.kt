package com.lichka

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.RemoteViews
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ScheduledWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        for (id in appWidgetIds) {
            updateWidget(context, appWidgetManager, id)
        }
    }

    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: Bundle,
    ) {
        updateWidget(context, appWidgetManager, appWidgetId)
    }

    companion object {
        private const val SMALL_MAX = 1
        private const val MEDIUM_MAX = 4
        private const val LARGE_MAX = 10

        private val ROW_IDS =
            intArrayOf(
                R.id.widget_row_0,
                R.id.widget_row_1,
                R.id.widget_row_2,
                R.id.widget_row_3,
                R.id.widget_row_4,
                R.id.widget_row_5,
                R.id.widget_row_6,
                R.id.widget_row_7,
                R.id.widget_row_8,
                R.id.widget_row_9,
            )
        private val BODY_IDS =
            intArrayOf(
                R.id.widget_row_body_0,
                R.id.widget_row_body_1,
                R.id.widget_row_body_2,
                R.id.widget_row_body_3,
                R.id.widget_row_body_4,
                R.id.widget_row_body_5,
                R.id.widget_row_body_6,
                R.id.widget_row_body_7,
                R.id.widget_row_body_8,
                R.id.widget_row_body_9,
            )
        private val META_IDS =
            intArrayOf(
                R.id.widget_row_meta_0,
                R.id.widget_row_meta_1,
                R.id.widget_row_meta_2,
                R.id.widget_row_meta_3,
                R.id.widget_row_meta_4,
                R.id.widget_row_meta_5,
                R.id.widget_row_meta_6,
                R.id.widget_row_meta_7,
                R.id.widget_row_meta_8,
                R.id.widget_row_meta_9,
            )
        private val ICON_IDS =
            intArrayOf(
                R.id.widget_row_icon_0,
                R.id.widget_row_icon_1,
                R.id.widget_row_icon_2,
                R.id.widget_row_icon_3,
                R.id.widget_row_icon_4,
                R.id.widget_row_icon_5,
                R.id.widget_row_icon_6,
                R.id.widget_row_icon_7,
                R.id.widget_row_icon_8,
                R.id.widget_row_icon_9,
            )

        fun refreshAll(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val ids =
                manager.getAppWidgetIds(ComponentName(context, ScheduledWidgetProvider::class.java))
            if (ids.isEmpty()) return
            for (id in ids) {
                updateWidget(context, manager, id)
            }
        }

        private fun updateWidget(
            context: Context,
            manager: AppWidgetManager,
            appWidgetId: Int,
        ) {
            val options = manager.getAppWidgetOptions(appWidgetId)
            val minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 110)
            val minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 40)
            val maxItems = maxItemsForSize(minWidth, minHeight)

            val views = RemoteViews(context.packageName, R.layout.widget_scheduled)
            val items = ScheduledWidgetStorage.loadAll(context)
            val visible = items.take(maxItems)

            views.setTextViewText(R.id.widget_title, context.getString(R.string.widget_scheduled_title))
            views.setOnClickPendingIntent(
                R.id.widget_title,
                openScheduledPendingIntent(context, appWidgetId, null, 1000 + appWidgetId),
            )
            views.setOnClickPendingIntent(
                R.id.widget_root,
                openScheduledPendingIntent(context, appWidgetId, null, 2000 + appWidgetId),
            )

            if (visible.isEmpty()) {
                views.setViewVisibility(R.id.widget_empty, View.VISIBLE)
                views.setViewVisibility(R.id.widget_list, View.GONE)
                views.setTextViewText(
                    R.id.widget_empty,
                    context.getString(R.string.widget_scheduled_empty),
                )
            } else {
                views.setViewVisibility(R.id.widget_empty, View.GONE)
                views.setViewVisibility(R.id.widget_list, View.VISIBLE)
            }

            for (i in ROW_IDS.indices) {
                if (i < visible.size) {
                    val item = visible[i]
                    views.setViewVisibility(ROW_IDS[i], View.VISIBLE)
                    val body =
                        if (item.body.isNotBlank()) {
                            item.body
                        } else {
                            context.getString(R.string.widget_scheduled_untitled)
                        }
                    views.setTextViewText(BODY_IDS[i], body)
                    views.setTextViewText(META_IDS[i], formatMeta(item))
                    views.setImageViewResource(ICON_IDS[i], iconForType(item.type))
                    views.setOnClickPendingIntent(
                        ROW_IDS[i],
                        openScheduledPendingIntent(
                            context,
                            appWidgetId,
                            item.messageId,
                            3000 + appWidgetId * 20 + i,
                        ),
                    )
                } else {
                    views.setViewVisibility(ROW_IDS[i], View.GONE)
                }
            }

            manager.updateAppWidget(appWidgetId, views)
        }

        private fun maxItemsForSize(minWidthDp: Int, minHeightDp: Int): Int {
            return when {
                minHeightDp < 100 -> SMALL_MAX
                minHeightDp < 220 && minWidthDp < 250 -> MEDIUM_MAX
                minHeightDp < 220 -> MEDIUM_MAX
                else -> LARGE_MAX
            }
        }

        private fun iconForType(type: String): Int {
            return when (type) {
                "alarm" -> R.drawable.ic_widget_alarm
                "periodic" -> R.drawable.ic_widget_repeat
                else -> R.drawable.ic_widget_bell
            }
        }

        private fun formatMeta(item: ScheduledWidgetStorage.Item): String {
            val title = item.chatTitle.ifBlank { "—" }
            if (item.scheduledAtMillis <= 0L) return title
            val time =
                SimpleDateFormat("dd.MM HH:mm", Locale.getDefault())
                    .format(Date(item.scheduledAtMillis))
            return "$title · $time"
        }

        private fun openScheduledPendingIntent(
            context: Context,
            appWidgetId: Int,
            messageId: String?,
            requestCode: Int,
        ): PendingIntent {
            val intent =
                Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP
                    putExtra(WidgetModule.EXTRA_OPEN_TARGET, WidgetModule.OPEN_TARGET_SCHEDULED)
                    if (messageId != null) {
                        putExtra(WidgetModule.EXTRA_MESSAGE_ID, messageId)
                    }
                    putExtra("appWidgetId", appWidgetId)
                }
            return PendingIntent.getActivity(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        }
    }
}
