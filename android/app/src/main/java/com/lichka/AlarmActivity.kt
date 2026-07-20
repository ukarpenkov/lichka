package com.lichka

import android.app.Activity
import android.app.NotificationManager
import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
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
import android.widget.ImageView
import android.widget.TextView
import androidx.core.graphics.drawable.DrawableCompat
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

        cancelAlarmNotification()

        val themeBackground = ThemeModule.getBackground(this)
        val themeText = ThemeModule.getText(this)

        applyTheme(themeBackground, themeText)
        applyFonts()

        val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())

        findViewById<TextView>(R.id.alarm_body).text = body.ifBlank { chatTitle }

        if (triggerTime > 0) {
            findViewById<TextView>(R.id.alarm_time).text = timeFormat.format(Date(triggerTime))
        } else {
            findViewById<TextView>(R.id.alarm_time).text = timeFormat.format(Date())
        }

        findViewById<TextView>(R.id.status_time).text = timeFormat.format(Date())

        findViewById<TextView>(R.id.btn_dismiss).setOnClickListener {
            stopAlarm()
            cancelAlarmNotification()
            AlarmStorage.remove(this, messageId)
            finish()
        }

        findViewById<TextView>(R.id.btn_snooze).setOnClickListener {
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

    private fun applyFonts() {
        val display = Typeface.createFromAsset(assets, "fonts/PressStart2P-Regular.ttf")
        val mono = Typeface.createFromAsset(assets, "fonts/JetBrainsMono-Regular.ttf")
        val monoMedium = Typeface.createFromAsset(assets, "fonts/JetBrainsMono-Medium.ttf")
        val monoSemiBold = Typeface.createFromAsset(assets, "fonts/JetBrainsMono-SemiBold.ttf")

        findViewById<TextView>(R.id.top_label).typeface = monoSemiBold
        findViewById<TextView>(R.id.status_time).typeface = mono
        findViewById<TextView>(R.id.alarm_time).typeface = display
        findViewById<TextView>(R.id.alarm_body).typeface = mono
        findViewById<TextView>(R.id.btn_dismiss).typeface = monoMedium
        findViewById<TextView>(R.id.btn_snooze).typeface = monoMedium
    }

    private fun applyTheme(background: String, text: String) {
        val bgColor = parseColorOr(background, Color.parseColor("#0a0a0a"))
        val textColor = parseColorOr(text, Color.WHITE)
        val muted = withAlpha(textColor, 0.6f)
        val surfaceStrong = withAlpha(textColor, 0.12f)

        val root = findViewById<View>(R.id.alarm_root)
        root.setBackgroundColor(bgColor)

        findViewById<TextView>(R.id.top_label).setTextColor(muted)
        findViewById<TextView>(R.id.status_time).setTextColor(muted)
        findViewById<TextView>(R.id.alarm_time).setTextColor(textColor)
        findViewById<TextView>(R.id.alarm_body).setTextColor(muted)

        val dismissBtn = findViewById<TextView>(R.id.btn_dismiss)
        dismissBtn.setTextColor(DESTRUCTIVE)
        tintCompoundDrawables(dismissBtn, DESTRUCTIVE)

        val snoozeBtn = findViewById<TextView>(R.id.btn_snooze)
        snoozeBtn.setTextColor(muted)
        tintCompoundDrawables(snoozeBtn, muted)

        val icon = findViewById<ImageView>(R.id.alarm_icon)
        icon.imageTintList = ColorStateList.valueOf(textColor)

        findViewById<View>(R.id.alarm_icon_ring).background =
            ovalFill(surfaceStrong)
        findViewById<View>(R.id.alarm_pulse_ring_1).background =
            ovalStroke(surfaceStrong)
        findViewById<View>(R.id.alarm_pulse_ring_2).background =
            ovalStroke(surfaceStrong)
    }

    private fun tintCompoundDrawables(view: TextView, color: Int) {
        val drawables = view.compoundDrawablesRelative
        for (i in drawables.indices) {
            val d = drawables[i] ?: continue
            val wrapped = DrawableCompat.wrap(d.mutate())
            DrawableCompat.setTint(wrapped, color)
            drawables[i] = wrapped
        }
        view.setCompoundDrawablesRelative(
            drawables[0],
            drawables[1],
            drawables[2],
            drawables[3],
        )
    }

    private fun ovalFill(color: Int): GradientDrawable {
        return GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(color)
        }
    }

    private fun ovalStroke(color: Int): GradientDrawable {
        return GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.TRANSPARENT)
            setStroke(dp(1), color)
        }
    }

    private fun dp(value: Int): Int {
        return (value * resources.displayMetrics.density).toInt().coerceAtLeast(1)
    }

    private fun startAnimations() {
        val icon = findViewById<ImageView>(R.id.alarm_icon)
        val shakeAnim = AnimationUtils.loadAnimation(this, R.anim.shake_alarm)
        icon.startAnimation(shakeAnim)

        val pulseAnim = AnimationUtils.loadAnimation(this, R.anim.pulse_ring_set)
        findViewById<View>(R.id.alarm_pulse_ring_1).startAnimation(pulseAnim)

        val pulseAnim2 = AnimationUtils.loadAnimation(this, R.anim.pulse_ring_set)
        pulseAnim2.startOffset = PULSE_DELAY
        findViewById<View>(R.id.alarm_pulse_ring_2).startAnimation(pulseAnim2)
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
        private const val PULSE_DELAY = 800L
        private val DESTRUCTIVE = Color.parseColor("#E53935")

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
    }
}
