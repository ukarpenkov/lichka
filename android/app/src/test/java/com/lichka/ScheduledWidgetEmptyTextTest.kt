package com.lichka

import org.junit.Assert.*
import org.junit.Test

class ScheduledWidgetEmptyTextTest {
    @Test fun reusesTheTextImageForRepeatedRefreshes() {
        assertEquals(key(), key())
    }

    @Test fun invalidatesTheTextImageForLocaleThemeSizeAndFontScale() {
        val keys = listOf(
            key(), key(text = "Нет запланированных сообщений"), key(ink = -1),
            key(width = 400), key(height = 100), key(scale = 3f),
        )
        assertEquals(keys.size, keys.toSet().size)
    }

    @Test fun keepsLocaleTextOutOfFilenames() {
        val key = key(text = "A / B\nСообщения: ?")
        assertFalse(key.contains('/'))
        assertFalse(key.contains('\n'))
        assertFalse(key.contains("Сообщения"))
    }

    private fun key(text: String = "No scheduled messages", width: Int = 300, height: Int = 200, scale: Float = 2f, ink: Int = 42) =
        ScheduledWidgetEmptyText.cacheKey(text, width, height, scale, ink)
}
