package com.lichka

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.ColorStateList
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.RectF
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.util.SizeF
import android.widget.RemoteViews
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream

class ScheduledWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        try {
            for (id in appWidgetIds) {
                updateWidget(context, appWidgetManager, id)
            }
        } catch (e: Exception) {
            Log.e(TAG, "onUpdate crashed", e)
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

        private const val HARD_SHADOW_DP = 4f
        private const val HARD_BORDER_DP = 2f
        private const val CORNER_RADIUS_DP = 16f
        private const val FILE_PROVIDER_SUFFIX = ".fileprovider"
        private const val PLATE_DIR = "widget_plates"
        private const val MAX_BITMAP_PX = 480
        private const val TAG = "ScheduledWidget"

        private val refreshHandler = Handler(Looper.getMainLooper())
        private val refreshLock = Any()
        @Volatile private var refreshPending = false
        @Volatile private var refreshRunning = false

        /**
         * Coalesce rapid refreshAll calls (setTheme + AppState background re-push) so we do not
         * stack competing updateAppWidget binder transactions.
         */
        fun refreshAll(context: Context) {
            val appContext = context.applicationContext
            synchronized(refreshLock) {
                refreshPending = true
                if (refreshRunning) return
                refreshRunning = true
            }
            refreshHandler.post { drainRefreshQueue(appContext) }
        }

        private fun drainRefreshQueue(context: Context) {
            while (true) {
                synchronized(refreshLock) {
                    if (!refreshPending) {
                        refreshRunning = false
                        return
                    }
                    refreshPending = false
                }
                refreshAllNow(context)
            }
        }

        private fun refreshAllNow(context: Context) {
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
            try {
                updateWidgetInner(context, manager, appWidgetId, preferUriPlate = true)
            } catch (_: Exception) {
                // Host shows «Не удалось загрузить виджет» if update throws / URI is denied.
                // Last resort: binder bitmap plate, still themed (coalesce keeps this rare).
                try {
                    updateWidgetInner(context, manager, appWidgetId, preferUriPlate = false)
                } catch (_: Exception) {
                    // Ignore — better a stale frame than a permanent error placeholder.
                }
            }
        }

        private fun updateWidgetInner(
            context: Context,
            manager: AppWidgetManager,
            appWidgetId: Int,
            preferUriPlate: Boolean,
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_scheduled)

            val canvasColor =
                parseColorOr(ThemeModule.getBackground(context), Color.parseColor("#FAFAFA"))
            val inkColor = parseColorOr(ThemeModule.getText(context), Color.BLACK)
            val mutedColor = withAlpha(inkColor, 0.6f)

            applyThemePlate(
                context,
                manager,
                appWidgetId,
                views,
                canvasColor,
                inkColor,
                preferUriPlate,
            )
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
                    // instead of reusing a stale RemoteViewsFactory. Factory also reads them.
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
         * Neo-brutal plate as a PNG on disk + setImageViewUri (not setImageViewBitmap).
         *
         * Large bitmaps in RemoteViews go through Binder IPC (~1MB shared buffer) and can fail
         * intermittently: text colors apply, plate/shadow/icons stay on the old theme.
         * File URI keeps the binder payload tiny; colors stay in pixels (no sticky ImageView tint).
         * Size from current widget bounds (SIZES / MIN_*), not MAX_* — avoids elliptical corners.
         */
        private fun applyThemePlate(
            context: Context,
            manager: AppWidgetManager,
            appWidgetId: Int,
            views: RemoteViews,
            canvasColor: Int,
            inkColor: Int,
            preferUriPlate: Boolean,
        ) {
            val (widthPx, heightPx) = widgetSizePx(context, manager, appWidgetId)
            val density = context.resources.displayMetrics.density
            clearImageTint(views, R.id.widget_plate)

            val bitmap = createNeoBrutalPlate(widthPx, heightPx, density, canvasColor, inkColor)
            if (preferUriPlate) {
                val written =
                    writePlatePng(
                        context,
                        appWidgetId,
                        bitmap,
                        canvasColor,
                        inkColor,
                        widthPx,
                        heightPx,
                    )
                if (written != null) {
                    // Grant on the display URI (with cache-bust query) — the launcher opens
                    // the exact URI from setImageViewUri, not the bare content://…/plate_N.png.
                    // Without a matching grant, the host gets SecurityException →
                    // «Не удалось загрузить виджет».
                    val granted = grantUriToHomeLaunchers(context, written.displayUri)
                    Log.d(
                        TAG,
                        "widget $appWidgetId: URI grants=$granted, size=${widthPx}x$heightPx, uri=${written.displayUri}",
                    )
                    if (granted > 0) {
                        views.setImageViewUri(R.id.widget_plate, written.displayUri)
                        bitmap.recycle()
                        return
                    }
                    Log.w(TAG, "widget $appWidgetId: NO grants, falling back to bitmap")
                }
            }
            // Fallback: downscale bitmap to safe Binder size, then setImageViewBitmap.
            val safeBitmap = safeBinderBitmap(bitmap)
            if (safeBitmap !== bitmap) bitmap.recycle()
            views.setImageViewBitmap(R.id.widget_plate, safeBitmap)
        }

        private data class PlateUris(val displayUri: Uri)

        private fun writePlatePng(
            context: Context,
            appWidgetId: Int,
            bitmap: Bitmap,
            canvasColor: Int,
            inkColor: Int,
            widthPx: Int,
            heightPx: Int,
        ): PlateUris? {
            return try {
                val dir = File(context.cacheDir, PLATE_DIR).apply { mkdirs() }
                val file = File(dir, "plate_$appWidgetId.png")
                FileOutputStream(file).use { out ->
                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
                }
                val fileUri =
                    FileProvider.getUriForFile(
                        context,
                        context.packageName + FILE_PROVIDER_SUFFIX,
                        file,
                    )
                val displayUri =
                    fileUri
                        .buildUpon()
                        .appendQueryParameter(
                            "v",
                            "${Integer.toHexString(canvasColor)}_${Integer.toHexString(inkColor)}_${widthPx}x$heightPx",
                        )
                        .build()
                PlateUris(displayUri = displayUri)
            } catch (_: Exception) {
                null
            }
        }

        private fun safeBinderBitmap(source: Bitmap): Bitmap {
            val maxSide = maxOf(source.width, source.height)
            if (maxSide <= MAX_BITMAP_PX) return source
            val scale = MAX_BITMAP_PX.toFloat() / maxSide.toFloat()
            val w = (source.width * scale).toInt().coerceAtLeast(1)
            val h = (source.height * scale).toInt().coerceAtLeast(1)
            val scaled = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(scaled)
            val paint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)
            val matrix = Matrix().apply { setScale(scale, scale) }
            canvas.drawBitmap(source, matrix, paint)
            Log.d(TAG, "scaled bitmap ${source.width}x${source.height} → ${w}x$h for Binder safety")
            return scaled
        }

        /**
         * Grant read access to home launchers (and common widget hosts).
         *
         * @return number of **HOME** packages that received a grant. Extra host packages
         * (SystemUI, OEM launchers) are granted opportunistically but do **not** count —
         * otherwise a successful SystemUI grant would enable setImageViewUri while the
         * real launcher still lacks permission → «Не удалось загрузить виджет».
         */
        private fun grantUriToHomeLaunchers(context: Context, uri: Uri): Int {
            val flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_PREFIX_URI_PERMISSION
            val homeGranted = linkedSetOf<String>()
            val extrasGranted = linkedSetOf<String>()
            val home = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)

            fun tryGrant(packageName: String?, into: MutableSet<String>) {
                if (packageName.isNullOrBlank() || packageName in homeGranted || packageName in extrasGranted) {
                    return
                }
                try {
                    context.grantUriPermission(packageName, uri, flags)
                    into.add(packageName)
                } catch (_: Exception) {
                    // Package missing or rejects grants.
                }
            }

            // Default home (works even when query list is filtered).
            try {
                val resolved =
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        context.packageManager.resolveActivity(
                            home,
                            PackageManager.ResolveInfoFlags.of(
                                PackageManager.MATCH_DEFAULT_ONLY.toLong(),
                            ),
                        )
                    } else {
                        @Suppress("DEPRECATION")
                        context.packageManager.resolveActivity(home, PackageManager.MATCH_DEFAULT_ONLY)
                    }
                tryGrant(resolved?.activityInfo?.packageName, homeGranted)
            } catch (_: Exception) {
                // ignore
            }

            try {
                val launchers =
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        context.packageManager.queryIntentActivities(
                            home,
                            PackageManager.ResolveInfoFlags.of(
                                PackageManager.MATCH_DEFAULT_ONLY.toLong(),
                            ),
                        )
                    } else {
                        @Suppress("DEPRECATION")
                        context.packageManager.queryIntentActivities(
                            home,
                            PackageManager.MATCH_DEFAULT_ONLY,
                        )
                    }
                for (info in launchers) {
                    tryGrant(info.activityInfo?.packageName, homeGranted)
                }
            } catch (_: Exception) {
                // ignore
            }

            // Opportunistic extras — only useful once a real HOME grant exists.
            if (homeGranted.isNotEmpty()) {
                for (pkg in EXTRA_WIDGET_HOST_PACKAGES) {
                    tryGrant(pkg, extrasGranted)
                }
            }

            return homeGranted.size
        }

        private val EXTRA_WIDGET_HOST_PACKAGES =
            arrayOf(
                "com.android.systemui",
                "com.google.android.apps.nexuslauncher",
                "com.android.launcher3",
                "com.android.launcher",
                "com.miui.home",
                "com.huawei.android.launcher",
                "com.samsung.android.app.launcher",
                "com.sec.android.app.launcher",
                "com.oneplus.launcher",
                "com.oppo.launcher",
                "com.realme.launcher",
                "com.vivo.launcher",
                "com.bbk.launcher2",
                "org.lineageos.launcher",
            )

        private fun clearImageTint(views: RemoteViews, viewId: Int) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                views.setColorStateList(viewId, "setImageTintList", null as ColorStateList?)
            }
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
            val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }

            val faceRight = (width - offset).toFloat()
            val faceBottom = (height - offset).toFloat()

            // 1) Hard shadow (ink), offset bottom-right
            paint.color = inkColor
            canvas.drawRoundRect(
                RectF(offset.toFloat(), offset.toFloat(), width.toFloat(), height.toFloat()),
                radius,
                radius,
                paint,
            )

            // 2) Outer plate in ink — solid border color under the face
            canvas.drawRoundRect(
                RectF(0f, 0f, faceRight, faceBottom),
                radius,
                radius,
                paint,
            )

            // 3) Inner canvas inset by border
            val innerRadius = (radius - stroke).coerceAtLeast(0f)
            paint.color = canvasColor
            canvas.drawRoundRect(
                RectF(
                    stroke.toFloat(),
                    stroke.toFloat(),
                    faceRight - stroke,
                    faceBottom - stroke,
                ),
                innerRadius,
                innerRadius,
                paint,
            )

            return bitmap
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
            // Prefer MIN_* (current size). MAX_* made fitXY stretch corners into ellipses.
            val widthDp = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 180)
            val heightDp = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 110)
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
