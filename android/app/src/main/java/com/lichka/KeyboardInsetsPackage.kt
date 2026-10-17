package com.lichka

import android.view.View
import android.view.ViewTreeObserver
import android.view.WindowManager
import android.os.Build
import android.graphics.Rect
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.ViewManager
import com.facebook.react.uimanager.events.Event

/** A non-interactive probe filling the unadjusted container, in either an Activity or Modal. */
internal class KeyboardInsetsView(private val reactContext: ThemedReactContext) :
    View(reactContext), ViewTreeObserver.OnPreDrawListener {
    private val position = IntArray(2)
    private val visibleFrame = Rect()
    private var lastOverlap = -1

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        lastOverlap = -1
        viewTreeObserver.addOnPreDrawListener(this)
    }

    override fun onDetachedFromWindow() {
        viewTreeObserver.removeOnPreDrawListener(this)
        super.onDetachedFromWindow()
    }

    override fun onPreDraw(): Boolean {
        val insets = ViewCompat.getRootWindowInsets(this) ?: return true
        getLocationOnScreen(position)
        val imeBottom = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
        // Window metrics include IME-covered space even when adjustResize already
        // shrank the decor. Using decor.height here would compensate twice.
        val windowBottom = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            rootView.context.getSystemService(WindowManager::class.java).currentWindowMetrics.bounds.bottom
        } else {
            rootView.getWindowVisibleDisplayFrame(visibleFrame)
            visibleFrame.bottom + imeBottom
        }
        val overlap = keyboardOverlap(
            position[1], height, windowBottom, imeBottom,
            insets.isVisible(WindowInsetsCompat.Type.ime()),
        )
        if (overlap != lastOverlap && id != NO_ID) {
            val dispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
            if (dispatcher != null) {
                lastOverlap = overlap
                dispatcher.dispatchEvent(KeyboardOverlapEvent(
                    UIManagerHelper.getSurfaceId(this), id, PixelUtil.toDIPFromPixel(overlap.toFloat()),
                ))
            }
        }
        return true
    }
}

private class KeyboardOverlapEvent(surfaceId: Int, viewId: Int, private val overlap: Float) :
    Event<KeyboardOverlapEvent>(surfaceId, viewId) {
    override fun getEventName() = "topKeyboardOverlap"
    override fun getEventData() = Arguments.createMap().apply {
        putDouble("overlap", overlap.toDouble())
    }
}

internal class KeyboardInsetsManager : SimpleViewManager<KeyboardInsetsView>() {
    override fun getName() = "LichkaKeyboardInsets"
    override fun createViewInstance(context: ThemedReactContext) = KeyboardInsetsView(context)
    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> =
        mutableMapOf("topKeyboardOverlap" to mapOf("registrationName" to "onKeyboardOverlap"))
}

class KeyboardInsetsPackage : ReactPackage {
    override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = emptyList()
    override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> =
        listOf(KeyboardInsetsManager())
}
