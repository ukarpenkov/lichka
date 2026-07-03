package com.lichka

import android.app.Activity
import android.app.NotificationManager
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.LayerDrawable
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.View
import android.view.WindowManager
import android.view.animation.AnimationUtils
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class AlarmActivity : Activity() {

    private var mediaPlayer: MediaPlayer? = null
    private var vibrator: Vibrator? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private lateinit var messageId: String
    private lateinit var chatId: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON,
            )
        }

        setContentView(R.layout.activity_alarm)

        val chatTitle = intent.getStringExtra(AlarmScheduler.EXTRA_CHAT_TITLE) ?: ""
        val body = intent.getStringExtra(AlarmScheduler.EXTRA_BODY) ?: ""
        messageId = intent.getStringExtra(AlarmScheduler.EXTRA_MESSAGE_ID) ?: ""
        chatId = intent.getStringExtra(AlarmScheduler.EXTRA_CHAT_ID) ?: ""
        val triggerTime = intent.getLongExtra(AlarmScheduler.EXTRA_TRIGGER_TIME, 0)

        val themeBackground = ThemeModule.getBackground(this)
        val themeText = ThemeModule.getText(this)

        applyTheme(themeBackground, themeText)

        findViewById<TextView>(R.id.alarm_body).text = body

        if (triggerTime > 0) {
            val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
            findViewById<TextView>(R.id.alarm_time).text = timeFormat.format(Date(triggerTime))
        } else {
            findViewById<TextView>(R.id.alarm_time).visibility = View.GONE
        }

        findViewById<Button>(R.id.btn_dismiss).setOnClickListener {
            stopAlarm()
            cancelAlarmNotification()
            AlarmStorage.remove(this, messageId)
            finish()
        }

        findViewById<Button>(R.id.btn_snooze).setOnClickListener {
            stopAlarm()
            cancelAlarmNotification()
            AlarmStorage.remove(this, messageId)
            val snoozeTrigger = System.currentTimeMillis() + NotificationHelper.snoozeMinutes() * 60_000L
            AlarmScheduler.scheduleAlarm(this, messageId, chatId, body, chatTitle, snoozeTrigger)
            finish()
        }

        startAnimations()
        startAlarmSound()
        startVibration()
        acquireWakeLock()
    }

    private fun applyTheme(background: String, text: String) {
        val bgColor = parseColorOr(background, Color.parseColor("#1A1A2E"))
        val textColor = parseColorOr(text, Color.WHITE)

        val root = findViewById<View>(R.id.alarm_root)
        root.background = createBackground(bgColor)

        val timeView = findViewById<TextView>(R.id.alarm_time)
        timeView.setTextColor(withAlpha(textColor, 0.55f))

        val bodyView = findViewById<TextView>(R.id.alarm_body)
        bodyView.setTextColor(textColor)

        val dismissBtn = findViewById<Button>(R.id.btn_dismiss)
        dismissBtn.background = resources.getDrawable(R.drawable.bg_btn_dismiss, theme)
        dismissBtn.setTextColor(Color.WHITE)
        // Elevation shadow for dismiss button
        dismissBtn.stateListAnimator = null
        dismissBtn.elevation = 8f

        val snoozeBtn = findViewById<Button>(R.id.btn_snooze)
        val snoozeBg = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = 16f * resources.displayMetrics.density
            setColor(withAlpha(textColor, 0.08f))
            setStroke(
                (1f * resources.displayMetrics.density).toInt(),
                withAlpha(textColor, 0.08f),
            )
        }
        snoozeBtn.background = snoozeBg
        snoozeBtn.setTextColor(textColor)
        snoozeBtn.stateListAnimator = null
    }

    private fun createBackground(baseColor: Int): LayerDrawable {
        val layers = arrayOf(
            GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                orientation = GradientDrawable.Orientation.TOP_BOTTOM
                colors = intArrayOf(
                    lighten(baseColor, 0.08f),
                    darken(baseColor, 0.04f),
                )
            },
        )
        return LayerDrawable(layers)
    }

    private fun startAnimations() {
        val icon = findViewById<ImageView>(R.id.alarm_icon)
        val ring = findViewById<View>(R.id.alarm_ring)

        val shakeAnim = AnimationUtils.loadAnimation(this, R.anim.shake_alarm)
        icon.startAnimation(shakeAnim)

        val pulseAnim = AnimationUtils.loadAnimation(this, R.anim.pulse_ring_set)
        ring.startAnimation(pulseAnim)
    }

    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.SCREEN_BRIGHT_WAKE_LOCK or
                PowerManager.FULL_WAKE_LOCK or
                PowerManager.ACQUIRE_CAUSES_WAKEUP,
            "lichka:alarm",
        )
        wakeLock?.acquire(10 * 60 * 1000L)
    }

    private fun startAlarmSound() {
        val alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        mediaPlayer = MediaPlayer().apply {
            setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build(),
            )
            setDataSource(this@AlarmActivity, alarmUri)
            isLooping = true
            prepare()
            start()
        }
    }

    private fun startVibration() {
        vibrator = getSystemService(VIBRATOR_SERVICE) as Vibrator
        val pattern = longArrayOf(0, 500, 500)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator?.vibrate(VibrationEffect.createWaveform(pattern, 0))
        } else {
            @Suppress("DEPRECATION")
            vibrator?.vibrate(pattern, 0)
        }
    }

    private fun cancelAlarmNotification() {
        val manager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        manager.cancel(messageId.hashCode())
    }

    private fun stopAlarm() {
        mediaPlayer?.let {
            if (it.isPlaying) it.stop()
            it.release()
        }
        mediaPlayer = null
        vibrator?.cancel()
        vibrator = null
        wakeLock?.let {
            if (it.isHeld) it.release()
        }
        wakeLock = null
    }

    override fun onDestroy() {
        stopAlarm()
        super.onDestroy()
    }

    companion object {
        private fun parseColorOr(hex: String, fallback: Int): Int {
            return try {
                Color.parseColor(hex)
            } catch (_: Exception) {
                fallback
            }
        }

        private fun withAlpha(color: Int, alpha: Float): Int {
            val a = (Color.alpha(color) * alpha).toInt().coerceIn(0, 255)
            return Color.argb(a, Color.red(color), Color.green(color), Color.blue(color))
        }

        private fun lighten(color: Int, amount: Float): Int {
            val r = (Color.red(color) * (1f + amount)).toInt().coerceIn(0, 255)
            val g = (Color.green(color) * (1f + amount)).toInt().coerceIn(0, 255)
            val b = (Color.blue(color) * (1f + amount)).toInt().coerceIn(0, 255)
            return Color.argb(Color.alpha(color), r, g, b)
        }

        private fun darken(color: Int, amount: Float): Int {
            val r = (Color.red(color) * (1f - amount)).toInt().coerceIn(0, 255)
            val g = (Color.green(color) * (1f - amount)).toInt().coerceIn(0, 255)
            val b = (Color.blue(color) * (1f - amount)).toInt().coerceIn(0, 255)
            return Color.argb(Color.alpha(color), r, g, b)
        }
    }
}
