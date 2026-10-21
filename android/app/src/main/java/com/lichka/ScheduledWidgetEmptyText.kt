package com.lichka

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Typeface
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import android.text.TextUtils
import java.security.MessageDigest

/** Custom fonts cannot be loaded by a launcher's restricted RemoteViews context. */
internal object ScheduledWidgetEmptyText {
    private var typeface: Typeface? = null

    fun cacheKey(text: String, width: Int, height: Int, scaledDensity: Float, ink: Int): String {
        val digest = MessageDigest.getInstance("SHA-256")
            .digest(text.toByteArray(Charsets.UTF_8))
            .joinToString("") { "%02x".format(it) }
        return "v1_${width}x${height}_${scaledDensity.toBits()}_${ink}_$digest"
    }

    fun render(context: Context, text: String, width: Int, height: Int, ink: Int): Bitmap {
        val font = typeface ?: Typeface.createFromAsset(
            context.assets, "fonts/PressStart2P-Regular.ttf",
        ).also { typeface = it }
        val scaledDensity = context.resources.displayMetrics.scaledDensity
        val paint = TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
            color = ink
            typeface = font
        }
        fun layout(size: Int, maxLines: Int = Int.MAX_VALUE): StaticLayout {
            paint.textSize = size * scaledDensity
            return StaticLayout.Builder.obtain(text, 0, text.length, paint, width)
                .setAlignment(Layout.Alignment.ALIGN_CENTER)
                .setIncludePad(false)
                .setLineSpacing(4f * scaledDensity, 1f)
                .setBreakStrategy(Layout.BREAK_STRATEGY_BALANCED)
                .setHyphenationFrequency(Layout.HYPHENATION_FREQUENCY_NONE)
                .setMaxLines(maxLines)
                .setEllipsize(TextUtils.TruncateAt.END)
                .build()
        }
        var size = 16
        var textLayout = layout(size)
        val words = text.trim().split(Regex("\\s+"))
        // Prefer complete words (especially long localized captions) before emergency wrapping.
        while (size > 10 && (textLayout.height > height || words.any { paint.measureText(it) > width })) {
            textLayout = layout(--size)
        }
        if (textLayout.height > height) {
            val lineHeight = paint.fontSpacing + 4f * scaledDensity
            textLayout = layout(size, (height / lineHeight).toInt().coerceAtLeast(1))
        }
        val bitmap = Bitmap.createBitmap(width, minOf(height, textLayout.height).coerceAtLeast(1), Bitmap.Config.ARGB_8888)
        textLayout.draw(Canvas(bitmap))
        return bitmap
    }
}
