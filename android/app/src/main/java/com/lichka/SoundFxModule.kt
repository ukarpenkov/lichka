package com.lichka

import android.media.AudioAttributes
import android.media.MediaPlayer
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SoundFxModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val players = mutableMapOf<String, MediaPlayer>()

    init {
        load("send", R.raw.send_message)
        load("delete", R.raw.delete_message)
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun play(name: String) {
        val player = players[name] ?: return
        try {
            if (player.isPlaying) {
                player.pause()
            }
            player.seekTo(0)
            player.start()
        } catch (_: Exception) {
            reload(name)?.start()
        }
    }

    private fun load(name: String, resId: Int) {
        createPlayer(resId)?.let { players[name] = it }
    }

    private fun reload(name: String): MediaPlayer? {
        players.remove(name)?.release()
        val resId = when (name) {
            "send" -> R.raw.send_message
            "delete" -> R.raw.delete_message
            else -> return null
        }
        val player = createPlayer(resId) ?: return null
        players[name] = player
        return player
    }

    private fun createPlayer(resId: Int): MediaPlayer? {
        val player = MediaPlayer.create(reactApplicationContext, resId) ?: return null
        player.setAudioAttributes(
            AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build(),
        )
        player.setVolume(1f, 1f)
        return player
    }

    companion object {
        const val NAME = "SoundFxModule"
    }
}
