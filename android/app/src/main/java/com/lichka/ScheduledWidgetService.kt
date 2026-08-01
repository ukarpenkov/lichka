package com.lichka

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.PorterDuff
import android.graphics.PorterDuffColorFilter
import android.widget.RemoteViews
import android.widget.RemoteViewsService
import androidx.core.content.ContextCompat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ScheduledWidgetService : RemoteViewsService() {
    override fun onGetViewFactory(intent: Intent): RemoteViewsFactory {
        val inkColor =
            intent.getIntExtra(
                ScheduledWidgetProvider.EXTRA_THEME_INK,
                parseColorOr(ThemeModule.getText(applicationContext), Color.BLACK),
            )
        return ScheduledWidgetRemoteViewsFactory(applicationContext, inkColor)
    }
}

class ScheduledWidgetRemoteViewsFactory(
    private val context: Context,
    private val inkColorFromIntent: Int,
) : RemoteViewsService.RemoteViewsFactory {

    private var items: List<ScheduledWidgetStorage.Item> = emptyList()
    private var inkColor: Int = inkColorFromIntent

    override fun onCreate() {}

    override fun onDataSetChanged() {
        items = ScheduledWidgetStorage.loadAll(context)
        // Re-read theme on every notify: some launchers reuse the factory after a theme switch
        // and only call onDataSetChanged, keeping a stale constructor ink color.
        inkColor =
            parseColorOr(ThemeModule.getText(context), inkColorFromIntent)
    }

    override fun onDestroy() {
        items = emptyList()
    }

    override fun getCount(): Int = items.size

    override fun getViewAt(position: Int): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.widget_scheduled_row)
        if (position !in items.indices) {
            return views
        }

        val item = items[position]
        val mutedColor = withAlpha(inkColor, 0.6f)

        val body =
            if (item.body.isNotBlank()) {
                item.body
            } else {
                context.getString(R.string.widget_scheduled_untitled)
            }

        views.setTextViewText(R.id.widget_row_body, body)
        views.setTextViewText(R.id.widget_row_meta, formatMeta(item))
        views.setTextColor(R.id.widget_row_body, inkColor)
        views.setTextColor(R.id.widget_row_meta, mutedColor)
        views.setImageViewBitmap(
            R.id.widget_row_icon,
            tintedIconBitmap(context, iconForType(item.type), inkColor),
        )

        val fillInIntent =
            Intent().apply {
                putExtra(WidgetModule.EXTRA_MESSAGE_ID, item.messageId)
                putExtra(WidgetModule.EXTRA_OPEN_TARGET, WidgetModule.OPEN_TARGET_SCHEDULED)
            }
        views.setOnClickFillInIntent(R.id.widget_row_root, fillInIntent)

        return views
    }

    override fun getLoadingView(): RemoteViews? = null

    override fun getViewTypeCount(): Int = 1

    override fun getItemId(position: Int): Long =
        items.getOrNull(position)?.messageId?.hashCode()?.toLong() ?: position.toLong()

    override fun hasStableIds(): Boolean = true

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

    private fun tintedIconBitmap(context: Context, resId: Int, color: Int): Bitmap {
        val density = context.resources.displayMetrics.density
        val size = (18f * density).toInt().coerceAtLeast(1)
        val drawable = ContextCompat.getDrawable(context, resId)?.mutate()
            ?: return Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        drawable.colorFilter = PorterDuffColorFilter(color, PorterDuff.Mode.SRC_IN)
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, size, size)
        drawable.draw(canvas)
        return bitmap
    }

    private fun withAlpha(color: Int, alpha: Float): Int {
        val a = (255 * alpha).toInt().coerceIn(0, 255)
        return Color.argb(a, Color.red(color), Color.green(color), Color.blue(color))
    }
}

private fun parseColorOr(hex: String, fallback: Int): Int {
    return try {
        Color.parseColor(hex)
    } catch (_: Exception) {
        fallback
    }
}
