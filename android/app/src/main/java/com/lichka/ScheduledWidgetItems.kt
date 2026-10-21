package com.lichka

/** Same upcoming-only rule as the scheduled screen, including persistent periodic reminders. */
internal fun isScheduledWidgetItemVisible(type: String, scheduledAt: Long, now: Long): Boolean =
    type == "periodic" || scheduledAt > now
