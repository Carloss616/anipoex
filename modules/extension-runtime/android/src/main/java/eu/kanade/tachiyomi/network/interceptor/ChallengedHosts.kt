package eu.kanade.tachiyomi.network.interceptor

import java.util.concurrent.ConcurrentHashMap

/** Hosts that served a Cloudflare challenge since the runtime started. */
object ChallengedHosts {
    val hosts: MutableSet<String> = ConcurrentHashMap.newKeySet()
}
