package com.lichka

import java.io.File
import java.io.IOException
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder

class ScheduledWidgetPlateTest {
    @get:Rule val temporary = TemporaryFolder()

    private val spec = ScheduledWidgetPlateSpec(360, 220, 2f, 0xff000000.toInt(), 0xff39ff14.toInt())

    @Test fun matchesCalendarCornersAndPreservesTheBorderAndShadow() {
        assertEquals(72f, spec.radius, 0f)
        assertEquals(68f, spec.innerRadius, 0f)
        assertEquals(4, spec.border)
        assertEquals(8, spec.shadow)
    }

    @Test fun keepsTheBorderConcentricOnShortWidgets() {
        val short = spec.copy(height = 80)
        assertEquals(36f, short.radius, 0f)
        assertEquals(32f, short.innerRadius, 0f)
    }

    @Test fun neverProducesNegativeRadiiOrZeroWidthBorders() {
        val tiny = spec.copy(width = 1, height = 1, density = 0.1f)
        assertEquals(0f, tiny.radius, 0f)
        assertEquals(0f, tiny.innerRadius, 0f)
        assertEquals(1, tiny.border)
        assertEquals(1, tiny.shadow)
    }

    @Test fun changesCacheIdentityForEitherThemeColorResizeAndDensity() {
        val variants = listOf(
            spec,
            spec.copy(canvasColor = -1),
            spec.copy(inkColor = -1),
            spec.copy(width = 400),
            spec.copy(height = 250),
            spec.copy(density = 3f),
        )
        assertEquals(variants.size, variants.map { it.cacheKey }.toSet().size)
        assertEquals(spec.cacheKey, spec.copy().cacheKey)
    }

    @Test fun reusesThePlateAcrossListUpdatesAndProcessRestarts() {
        val dir = File(temporary.root, "widget_1")
        val first = ScheduledWidgetPlateCache(dir).getOrCreate(spec.cacheKey) { it.writeText("pixels") }
        val second = ScheduledWidgetPlateCache(dir).getOrCreate(spec.cacheKey) {
            fail("An unchanged appearance must not draw or compress a bitmap")
        }
        assertEquals(first, second)
        assertEquals("pixels", second.readText())
    }

    @Test fun preservesThePreviousThemeWhilePublishingTheNextTheme() {
        val cache = ScheduledWidgetPlateCache(temporary.root)
        val dark = cache.getOrCreate(spec.cacheKey) { it.writeText("dark") }
        val light = cache.getOrCreate(spec.copy(canvasColor = -1).cacheKey) { it.writeText("light") }
        assertNotEquals(dark, light)
        assertEquals("dark", dark.readText())
        assertEquals("light", light.readText())
        assertEquals(dark, cache.getOrCreate(spec.cacheKey) { fail("Theme is cached") })
    }

    @Test fun regeneratesAPurgedOrEmptyCacheFile() {
        val cache = ScheduledWidgetPlateCache(temporary.root)
        val first = cache.getOrCreate(spec.cacheKey) { it.writeText("first") }
        first.delete()
        assertEquals("second", cache.getOrCreate(spec.cacheKey) { it.writeText("second") }.readText())
        first.writeText("")
        assertEquals("third", cache.getOrCreate(spec.cacheKey) { it.writeText("third") }.readText())
    }

    @Test fun keepsOnlyFourRecentPlatesPerWidget() {
        val cache = ScheduledWidgetPlateCache(temporary.root)
        repeat(8) { index ->
            cache.getOrCreate("theme_$index") { it.writeText("pixels_$index") }
                .setLastModified(index.toLong() + 1)
        }
        assertEquals(
            (4..7).map { "plate_theme_$it.png" }.toSet(),
            temporary.root.listFiles()!!.map { it.name }.toSet(),
        )
    }

    @Test fun failedWritesLeaveThePreviousPlateReadableAndCanBeRetried() {
        val cache = ScheduledWidgetPlateCache(temporary.root)
        val original = cache.getOrCreate("original") { it.writeText("original pixels") }
        assertThrows(IOException::class.java) {
            cache.getOrCreate("next") {
                it.writeText("partial")
                throw IOException("Disk unavailable")
            }
        }
        assertEquals(listOf(original), temporary.root.listFiles()!!.toList())
        assertEquals("original pixels", original.readText())
        assertEquals("next pixels", cache.getOrCreate("next") { it.writeText("next pixels") }.readText())
    }

    @Test fun rejectsEmptyWritesWithoutPublishingBrokenImages() {
        assertThrows(IllegalStateException::class.java) {
            ScheduledWidgetPlateCache(temporary.root).getOrCreate("empty") { }
        }
        assertTrue(temporary.root.listFiles()!!.isEmpty())
    }

    @Test fun failsCleanlyWhenTheCacheDirectoryIsUnavailable() {
        val file = temporary.newFile("not_a_directory")
        assertThrows(IllegalStateException::class.java) {
            ScheduledWidgetPlateCache(file).getOrCreate("test") { fail("Cannot write here") }
        }
    }
}
