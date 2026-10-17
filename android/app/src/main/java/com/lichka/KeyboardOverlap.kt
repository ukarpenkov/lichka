package com.lichka

/** All values are screen coordinates/pixels from the same window (including Dialogs). */
internal fun keyboardOverlap(
    viewTop: Int,
    viewHeight: Int,
    windowBottom: Int,
    imeBottom: Int,
    imeVisible: Boolean,
): Int {
    if (!imeVisible || imeBottom <= 0 || viewHeight <= 0) return 0
    val keyboardTop = windowBottom - imeBottom
    return (viewTop + viewHeight - keyboardTop).coerceIn(0, viewHeight)
}
