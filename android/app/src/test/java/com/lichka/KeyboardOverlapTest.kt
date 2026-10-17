package com.lichka

import org.junit.Assert.assertEquals
import org.junit.Test

class KeyboardOverlapTest {
    @Test fun liftsOnlyTheCoveredPartOfTheChat() {
        // Full window 900, tab bar + navigation consume 80, keyboard top 600.
        assertEquals(220, keyboardOverlap(24, 796, 900, 300, true))
    }

    @Test fun includesThreeButtonNavigationInTheKeyboardBoundary() {
        assertEquals(244, keyboardOverlap(24, 796, 900, 324, true))
    }

    @Test fun doesNotLiftAgainWhenAndroidAlreadyResizedTheWindow() {
        assertEquals(0, keyboardOverlap(24, 576, 900, 300, true))
    }

    @Test fun liftsTheWholeUnresizedModalAboveTheKeyboard() {
        assertEquals(300, keyboardOverlap(24, 876, 900, 300, true))
    }

    @Test fun followsKeyboardHeightChangesAndRotation() {
        assertEquals(320, keyboardOverlap(24, 796, 900, 400, true))
        assertEquals(160, keyboardOverlap(24, 296, 400, 240, true))
    }

    @Test fun usesTheCurrentWindowOriginInSplitScreen() {
        assertEquals(180, keyboardOverlap(424, 396, 900, 260, true))
    }

    @Test fun clearsTheInsetForHiddenOrFloatingKeyboards() {
        assertEquals(0, keyboardOverlap(24, 796, 900, 300, false))
        assertEquals(0, keyboardOverlap(24, 796, 900, 0, true))
    }

    @Test fun clampsToTheAvailableContainer() {
        assertEquals(100, keyboardOverlap(700, 100, 900, 400, true))
        assertEquals(0, keyboardOverlap(24, 100, 900, 300, true))
        assertEquals(0, keyboardOverlap(24, 0, 900, 300, true))
    }
}
