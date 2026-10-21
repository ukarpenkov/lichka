package com.lichka

import org.junit.Assert.*
import org.junit.Test

class ScheduledWidgetItemsTest {
    @Test fun keepsFutureRemindersAndAlarms() {
        for (type in listOf("reminder", "alarm")) {
            assertTrue(isScheduledWidgetItemVisible(type, 2000L, 1000L))
        }
    }

    @Test fun hidesOneShotMessagesAtTheirTriggerTime() {
        for (type in listOf("reminder", "alarm")) {
            assertFalse(isScheduledWidgetItemVisible(type, 1000L, 1000L))
            assertFalse(isScheduledWidgetItemVisible(type, 999L, 1000L))
            assertFalse(isScheduledWidgetItemVisible(type, 0L, 1000L))
        }
    }

    @Test fun keepsPeriodicRemindersAfterTheyFire() {
        assertTrue(isScheduledWidgetItemVisible("periodic", 999L, 1000L))
        assertTrue(isScheduledWidgetItemVisible("periodic", 0L, 1000L))
    }

    @Test fun reevaluatesUpcomingMessagesWhenTheClockChanges() {
        assertFalse(isScheduledWidgetItemVisible("reminder", 2000L, 3000L))
        assertTrue(isScheduledWidgetItemVisible("reminder", 2000L, 1000L))
    }
}
