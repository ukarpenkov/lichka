package com.lichka

import android.app.Activity
import android.app.NotificationManager
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView

class AlarmActivity : Activity() {

    private var mediaPlayer: MediaPlayer? = null
    private var vibrator: Vibrator? = null
    private lateinit var messageId: String

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
        val chatId = intent.getStringExtra(AlarmScheduler.EXTRA_CHAT_ID) ?: ""

        findViewById<TextView>(R.id.alarm_chat_title).text = chatTitle
        findViewById<TextView>(R.id.alarm_body).text = body

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

        startAlarmSound()
        startVibration()
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
    }

    override fun onDestroy() {
        stopAlarm()
        super.onDestroy()
    }
}
