package com.lichka

import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.webkit.MimeTypeMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

class IncomingShareModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    init {
        activeInstance = this
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun getInitialShare(promise: Promise) {
        if (shareConsumed) {
            promise.resolve(null)
            return
        }
        val payload = pendingShare ?: return promise.resolve(null)
        promise.resolve(payload.toWritableMap())
    }

    @ReactMethod
    fun consumeInitialShare() {
        markShareConsumed()
        stripShareFromActivity()
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for NativeEventEmitter
    }

    fun emitShareIfPending() {
        val payload = pendingShare ?: return
        val reactContext = reactApplicationContext
        if (!reactContext.hasActiveReactInstance()) {
            return
        }
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EVENT_SHARE, payload.toWritableMap())
        consumeInitialShare()
    }

    private fun stripShareFromActivity() {
        val activity = reactApplicationContext.currentActivity ?: return
        val apply =
            Runnable {
                val intent = activity.intent ?: return@Runnable
                if (intent.action != Intent.ACTION_SEND) {
                    return@Runnable
                }
                val cleaned = Intent(activity, activity.javaClass)
                cleaned.action = Intent.ACTION_MAIN
                cleaned.addCategory(Intent.CATEGORY_LAUNCHER)
                activity.intent = cleaned
            }
        if (UiThreadUtil.isOnUiThread()) {
            apply.run()
        } else {
            UiThreadUtil.runOnUiThread(apply)
        }
    }

    companion object {
        const val NAME = "IncomingShareModule"
        const val EVENT_SHARE = "onShareReceived"
        private const val INBOX_DIR = "share-inbox"
        private const val MAX_EDGE = 1920
        private const val JPEG_QUALITY = 70

        @Volatile
        private var pendingShare: SharePayload? = null

        @Volatile
        private var shareConsumed = false

        @Volatile
        private var activeInstance: IncomingShareModule? = null

        @JvmStatic
        fun emitPendingIfPossible() {
            activeInstance?.emitShareIfPending()
        }

        @JvmStatic
        fun captureShare(activity: Activity, intent: Intent?) {
            try {
                captureShareInner(activity, intent)
            } catch (_: Exception) {
                // Broken share extras must never prevent a normal launch.
            }
        }

        private fun captureShareInner(activity: Activity, intent: Intent?) {
            if (intent == null || intent.action != Intent.ACTION_SEND) {
                return
            }

            val text = readShareText(intent)
            val stream = extraStream(intent)
            val mime = intent.type ?: stream?.let { activity.contentResolver.getType(it) }

            var imagePath: String? = null
            var width = 0
            var height = 0

            if (stream != null && isImageMime(mime, activity, stream)) {
                val copied = copyShareImage(activity, stream, mime)
                if (copied != null) {
                    imagePath = copied.path
                    width = copied.width
                    height = copied.height
                }
            }

            if (text.isNullOrEmpty() && imagePath == null) {
                return
            }

            pendingShare =
                SharePayload(
                    text = text,
                    imagePath = imagePath,
                    width = width,
                    height = height,
                )
            shareConsumed = false
        }

        @JvmStatic
        fun markShareConsumed() {
            shareConsumed = true
            pendingShare = null
        }

        private fun readShareText(intent: Intent): String? {
            val raw =
                intent.getCharSequenceExtra(Intent.EXTRA_TEXT)?.toString()
                    ?: intent.getStringExtra(Intent.EXTRA_TEXT)
            val trimmed = raw?.trim().orEmpty()
            return trimmed.ifEmpty { null }
        }

        private fun extraStream(intent: Intent): Uri? {
            val fromExtra =
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
                } else {
                    @Suppress("DEPRECATION")
                    intent.getParcelableExtra(Intent.EXTRA_STREAM)
                }
            if (fromExtra != null) return fromExtra
            val clip = intent.clipData ?: return null
            if (clip.itemCount <= 0) return null
            return clip.getItemAt(0)?.uri
        }

        private fun isImageMime(mime: String?, activity: Activity, uri: Uri): Boolean {
            if (mime?.startsWith("image/") == true) return true
            val resolved = activity.contentResolver.getType(uri)
            return resolved?.startsWith("image/") == true
        }

        private fun copyShareImage(
            activity: Activity,
            uri: Uri,
            mime: String?,
        ): CopiedImage? {
            val inbox = File(activity.cacheDir, INBOX_DIR)
            if (!inbox.exists()) {
                inbox.mkdirs()
            }
            inbox.listFiles()?.forEach { it.delete() }

            val compressed = File(inbox, "${UUID.randomUUID()}.jpg")
            val decoded = decodeScaledBitmap(activity, uri)
            if (decoded != null) {
                return try {
                    FileOutputStream(compressed).use { out ->
                        decoded.bitmap.compress(Bitmap.CompressFormat.JPEG, JPEG_QUALITY, out)
                    }
                    val result =
                        CopiedImage(
                            path = compressed.absolutePath,
                            width = decoded.bitmap.width,
                            height = decoded.bitmap.height,
                        )
                    decoded.bitmap.recycle()
                    result
                } catch (_: Exception) {
                    decoded.bitmap.recycle()
                    copyRaw(activity, uri, inbox, mime)
                }
            }
            return copyRaw(activity, uri, inbox, mime)
        }

        private fun decodeScaledBitmap(activity: Activity, uri: Uri): DecodedBitmap? {
            return try {
                val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                activity.contentResolver.openInputStream(uri)?.use { input ->
                    BitmapFactory.decodeStream(input, null, bounds)
                }
                if (bounds.outWidth <= 0 || bounds.outHeight <= 0) {
                    return null
                }
                val sample = inSampleSize(bounds.outWidth, bounds.outHeight, MAX_EDGE)
                val opts = BitmapFactory.Options().apply { inSampleSize = sample }
                val bitmap =
                    activity.contentResolver.openInputStream(uri)?.use { input ->
                        BitmapFactory.decodeStream(input, null, opts)
                    } ?: return null
                DecodedBitmap(bitmap)
            } catch (_: Exception) {
                null
            }
        }

        private fun inSampleSize(width: Int, height: Int, maxEdge: Int): Int {
            var sample = 1
            var w = width
            var h = height
            while (w / 2 >= maxEdge && h / 2 >= maxEdge || w > maxEdge * 2 || h > maxEdge * 2) {
                w /= 2
                h /= 2
                sample *= 2
                if (sample >= 16) break
            }
            return sample
        }

        private fun copyRaw(
            activity: Activity,
            uri: Uri,
            inbox: File,
            mime: String?,
        ): CopiedImage? {
            val ext = extensionForMime(mime, uri)
            val dest = File(inbox, "${UUID.randomUUID()}.$ext")
            return try {
                activity.contentResolver.openInputStream(uri)?.use { input ->
                    FileOutputStream(dest).use { output ->
                        input.copyTo(output)
                    }
                } ?: return null
                CopiedImage(path = dest.absolutePath, width = 0, height = 0)
            } catch (_: Exception) {
                null
            }
        }

        private fun extensionForMime(mime: String?, uri: Uri): String {
            val fromMime = mime?.let { MimeTypeMap.getSingleton().getExtensionFromMimeType(it) }
            if (!fromMime.isNullOrEmpty()) return fromMime
            val last = uri.lastPathSegment ?: return "jpg"
            val dot = last.lastIndexOf('.')
            if (dot >= 0 && dot < last.length - 1) {
                return last.substring(dot + 1).lowercase()
            }
            return "jpg"
        }
    }
}

internal data class SharePayload(
    val text: String?,
    val imagePath: String?,
    val width: Int,
    val height: Int,
) {
    fun toWritableMap(): WritableMap =
        Arguments.createMap().apply {
            if (text != null) {
                putString("text", text)
            }
            if (imagePath != null) {
                putString("imagePath", imagePath)
            }
            if (width > 0) {
                putInt("width", width)
            }
            if (height > 0) {
                putInt("height", height)
            }
        }
}

private data class CopiedImage(
    val path: String,
    val width: Int,
    val height: Int,
)

private data class DecodedBitmap(
    val bitmap: Bitmap,
)
