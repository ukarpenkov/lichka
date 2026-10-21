package com.lichka

import java.io.File

/** Geometry and identity of the background only; list contents never invalidate it. */
internal data class ScheduledWidgetPlateSpec(
    val width: Int,
    val height: Int,
    val density: Float,
    val canvasColor: Int,
    val inkColor: Int,
) {
    val shadow = (4f * density).toInt().coerceAtLeast(1)
    val border = (2f * density).toInt().coerceAtLeast(1)
    val radius = minOf(36f * density, (minOf(width, height) - shadow) / 2f)
        .coerceAtLeast(0f)
    val innerRadius = (radius - border).coerceAtLeast(0f)

    // Bump the revision when drawing changes. Immutable filenames also invalidate host caches.
    val cacheKey = "v2_${width}x${height}_${density.toBits()}_${canvasColor}_${inkColor}"
}

/** Small disk cache: no bitmap allocations or PNG compression on a cache hit. */
internal class ScheduledWidgetPlateCache(
    private val directory: File,
    private val maxEntries: Int = 4,
) {
    @Synchronized
    fun getOrCreate(key: String, write: (File) -> Unit): File {
        check(directory.isDirectory || directory.mkdirs()) { "Cannot create widget plate cache" }
        val target = File(directory, "plate_$key.png")
        if (target.isFile && target.length() > 0L) {
            target.setLastModified(System.currentTimeMillis())
            return target
        }
        val temporary = File.createTempFile("plate_", ".tmp", directory)
        try {
            write(temporary)
            check(temporary.length() > 0L) { "Empty widget plate" }
            check(temporary.renameTo(target)) { "Cannot publish widget plate" }
        } finally {
            temporary.delete()
        }
        directory.listFiles()
            ?.filter { it != target && it.extension == "png" }
            ?.sortedByDescending { it.lastModified() }
            ?.drop((maxEntries - 1).coerceAtLeast(0))
            ?.forEach { it.delete() }
        return target
    }
}
