package com.lichka

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.net.Uri
import android.os.Bundle
import android.widget.RemoteViews

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
        private const val HARD_SHADOW_DP = 4f
        private const val HARD_BORDER_DP = 2f
        private const val CORNER_RADIUS_DP = 16f
        const val EXTRA_THEME_BACKGROUND = "com.lichka.widget.THEME_BACKGROUND"
        const val EXTRA_THEME_INK = "com.lichka.widget.THEME_INK"

        fun refreshAll(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val ids =
                manager.getAppWidgetIds(ComponentName(context, ScheduledWidgetProvider::class.java))
            if (ids.isEmpty()) return
            for (id in ids) {
                updateWidget(context, manager, id)
            }
            manager.notifyAppWidgetViewDataChanged(ids, R.id.widget_list)
        }

        private fun updateWidget(
            context: Context,
            manager: AppWidgetManager,
            appWidgetId: Int,
        ) {
            val options = manager.getAppWidgetOptions(appWidgetId)
            val views = RemoteViews(context.packageName, R.layout.widget_scheduled)

            val canvasColor =
                parseColorOr(ThemeModule.getBackground(context), Color.parseColor("#FAFAFA"))
            val inkColor = parseColorOr(ThemeModule.getText(context), Color.BLACK)
            val mutedColor = withAlpha(inkColor, 0.6f)

            applyThemePlate(context, views, options, canvasColor, inkColor)
            views.setTextColor(R.id.widget_title, inkColor)
            views.setTextColor(R.id.widget_empty, mutedColor)
            views.setTextViewText(R.id.widget_title, context.getString(R.string.widget_scheduled_title))
            views.setTextViewText(
                R.id.widget_empty,
                context.getString(R.string.widget_scheduled_empty),
            )

            val serviceIntent =
                Intent(context, ScheduledWidgetService::class.java).apply {
                    putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
                    // Theme extras change the intent URI so the adapter reconnects on theme switch
                    // instead of reusing a stale RemoteViewsFactory.
                    putExtra(EXTRA_THEME_BACKGROUND, canvasColor)
                    putExtra(EXTRA_THEME_INK, inkColor)
                    data = Uri.parse(toUri(Intent.URI_INTENT_SCHEME))
                }
            views.setRemoteAdapter(R.id.widget_list, serviceIntent)
            views.setEmptyView(R.id.widget_list, R.id.widget_empty)

            views.setOnClickPendingIntent(
                R.id.widget_title,
                openScheduledPendingIntent(context, appWidgetId, null, 1000 + appWidgetId),
            )
            views.setOnClickPendingIntent(
                R.id.widget_root,
                openScheduledPendingIntent(context, appWidgetId, null, 2000 + appWidgetId),
            )
            views.setOnClickPendingIntent(
                R.id.widget_empty,
                openScheduledPendingIntent(context, appWidgetId, null, 2500 + appWidgetId),
            )

            val templateIntent =
                Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP
                    putExtra(WidgetModule.EXTRA_OPEN_TARGET, WidgetModule.OPEN_TARGET_SCHEDULED)
                }
            val templatePendingIntent =
                PendingIntent.getActivity(
                    context,
                    4000 + appWidgetId,
                    templateIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE,
                )
            views.setPendingIntentTemplate(R.id.widget_list, templatePendingIntent)

            manager.updateAppWidget(appWidgetId, views)
            manager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.widget_list)
        }

        private fun applyThemePlate(
            context: Context,
            views: RemoteViews,
            options: Bundle,
            canvasColor: Int,
            inkColor: Int,
        ) {
            val density = context.resources.displayMetrics.density
            val widthDp =
                options.getInt(
                    AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH,
                    options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 180),
                )
            val heightDp =
                options.getInt(
                    AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT,
                    options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 110),
                )
            val widthPx = (widthDp * density).toInt().coerceAtLeast(120)
            val heightPx = (heightDp * density).toInt().coerceAtLeast(80)
            views.setImageViewBitmap(
                R.id.widget_plate,
                createNeoBrutalPlate(widthPx, heightPx, density, canvasColor, inkColor),
            )
        }

        private fun createNeoBrutalPlate(
            width: Int,
            height: Int,
            density: Float,
            canvasColor: Int,
            inkColor: Int,
        ): Bitmap {
            val offset = (HARD_SHADOW_DP * density).toInt().coerceAtLeast(1)
            val stroke = (HARD_BORDER_DP * density).toInt().coerceAtLeast(1)
            val radius = CORNER_RADIUS_DP * density
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            val paint = Paint(Paint.ANTI_ALIAS_FLAG)

            paint.style = Paint.Style.FILL
            paint.color = inkColor
            canvas.drawRoundRect(
                RectF(offset.toFloat(), offset.toFloat(), width.toFloat(), height.toFloat()),
                radius,
                radius,
                paint,
            )

            paint.color = canvasColor
            canvas.drawRoundRect(
                RectF(0f, 0f, (width - offset).toFloat(), (height - offset).toFloat()),
                radius,
                radius,
                paint,
            )

            paint.style = Paint.Style.STROKE
            paint.strokeWidth = stroke.toFloat()
            paint.color = inkColor
            val inset = stroke / 2f
            canvas.drawRoundRect(
                RectF(
                    inset,
                    inset,
                    width - offset - inset,
                    height - offset - inset,
                ),
                radius,
                radius,
                paint,
            )

            return bitmap
        }

        private fun parseColorOr(hex: String, fallback: Int): Int {
            return try {
                Color.parseColor(hex)
            } catch (_: Exception) {
                fallback
            }
        }

        private fun withAlpha(color: Int, alpha: Float): Int {
            val a = (255 * alpha).toInt().coerceIn(0, 255)
            return Color.argb(a, Color.red(color), Color.green(color), Color.blue(color))
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
