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
import android.graphics.PorterDuff
import android.graphics.PorterDuffColorFilter
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.SizeF
import android.widget.RemoteViews
import androidx.core.content.ContextCompat

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
            val views = RemoteViews(context.packageName, R.layout.widget_scheduled)

            val canvasColor =
                parseColorOr(ThemeModule.getBackground(context), Color.parseColor("#FAFAFA"))
            val inkColor = parseColorOr(ThemeModule.getText(context), Color.BLACK)
            val mutedColor = withAlpha(inkColor, 0.6f)

            applyThemePlate(context, manager, appWidgetId, views, canvasColor, inkColor)
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

        /**
         * Paint themed plate layers as bitmaps from shape drawables.
         *
         * ImageView tint / colorFilter via RemoteViews often sticks on the previous color when the
         * launcher reapplies an update (theme switch looks like a no-op). Fresh bitmaps always show
         * the new theme. Shapes are drawn at the current widget size so cornerRadius stays circular
         * (fitXY 1:1); onAppWidgetOptionsChanged regenerates after resize.
         */
        private fun applyThemePlate(
            context: Context,
            manager: AppWidgetManager,
            appWidgetId: Int,
            views: RemoteViews,
            canvasColor: Int,
            inkColor: Int,
        ) {
            val (widthPx, heightPx) = widgetSizePx(context, manager, appWidgetId)
            val density = context.resources.displayMetrics.density
            val shadow = (4f * density).toInt().coerceAtLeast(1)
            // Face margins: 2dp border + 4dp shadow on the trailing edges → 8dp total inset.
            val faceShrink = (8f * density).toInt().coerceAtLeast(1)

            setTintedShapeBitmap(
                context,
                views,
                R.id.widget_plate_shadow,
                R.drawable.widget_plate_round,
                inkColor,
                (widthPx - shadow).coerceAtLeast(1),
                (heightPx - shadow).coerceAtLeast(1),
            )
            setTintedShapeBitmap(
                context,
                views,
                R.id.widget_plate_border,
                R.drawable.widget_plate_round,
                inkColor,
                (widthPx - shadow).coerceAtLeast(1),
                (heightPx - shadow).coerceAtLeast(1),
            )
            setTintedShapeBitmap(
                context,
                views,
                R.id.widget_plate_face,
                R.drawable.widget_plate_round_inner,
                canvasColor,
                (widthPx - faceShrink).coerceAtLeast(1),
                (heightPx - faceShrink).coerceAtLeast(1),
            )
        }

        private fun setTintedShapeBitmap(
            context: Context,
            views: RemoteViews,
            viewId: Int,
            drawableRes: Int,
            color: Int,
            widthPx: Int,
            heightPx: Int,
        ) {
            val drawable =
                ContextCompat.getDrawable(context, drawableRes)?.mutate()
                    ?: return
            drawable.colorFilter = PorterDuffColorFilter(color, PorterDuff.Mode.SRC_IN)
            val bitmap = Bitmap.createBitmap(widthPx, heightPx, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            drawable.setBounds(0, 0, widthPx, heightPx)
            drawable.draw(canvas)
            views.setImageViewBitmap(viewId, bitmap)
        }

        private fun widgetSizePx(
            context: Context,
            manager: AppWidgetManager,
            appWidgetId: Int,
        ): Pair<Int, Int> {
            val density = context.resources.displayMetrics.density
            val options = manager.getAppWidgetOptions(appWidgetId)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val sizes: ArrayList<SizeF>? =
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        options.getParcelableArrayList(
                            AppWidgetManager.OPTION_APPWIDGET_SIZES,
                            SizeF::class.java,
                        )
                    } else {
                        @Suppress("DEPRECATION")
                        options.getParcelableArrayList(AppWidgetManager.OPTION_APPWIDGET_SIZES)
                    }
                val size = sizes?.firstOrNull()
                if (size != null && size.width > 0f && size.height > 0f) {
                    return Pair(
                        (size.width * density).toInt().coerceAtLeast(120),
                        (size.height * density).toInt().coerceAtLeast(80),
                    )
                }
            }
            // MIN_* is the current size on most launchers; MAX_* previously caused fitXY stretch.
            val widthDp =
                options.getInt(
                    AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH,
                    180,
                )
            val heightDp =
                options.getInt(
                    AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT,
                    110,
                )
            return Pair(
                (widthDp * density).toInt().coerceAtLeast(120),
                (heightDp * density).toInt().coerceAtLeast(80),
            )
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
