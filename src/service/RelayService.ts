import {Relay} from "nostr-tools"
import {Filter} from "nostr-tools/lib/types/filter"
import WebSocket from "ws"
import {sleep} from "../util/utils"
import {NostrEvent} from "../model/NostrEvent"

;(globalThis as any).WebSocket = WebSocket

export class RelayService {
    private static instance: RelayService | null = null
    public relayList: Relay[]
    timeoutMs = 2000

    static getInstance(): RelayService {
        if (!RelayService.instance) {
            RelayService.instance = new RelayService()
        }
        return RelayService.instance
    }

    constructor() {
        if (!process.env['RELAY_URL_LIST']) {
            throw new Error(`RELAY_URL_LIST not defined`)
        }
        this.relayList = []

        const relayURLList = process.env['RELAY_URL_LIST'].split(',').map(url => {
            return url.trim()
        })

        relayURLList.forEach(relayURL => {
            if (relayURL) {
                this.relayList.push(new Relay(relayURL))
            }
        })

        this.connectAll().catch(error => {
            console.warn('Failed to connect to relay:', formatRelayError(error))
        })
    }

    private async connectAll() {
        for (const relay of this.relayList) {
            await this.ensureConnected(relay)
        }
    }

    private async ensureConnected(relay: Relay) {
        if (relay.connected) {
            return
        }

        try {
            await relay.connect()
            console.log(`Connected to relay ${relay.url}`)
        } catch (error) {
            console.warn(`Failed to connect to relay ${relay.url}:`, formatRelayError(error))
        }
    }

    async getSingleEvent(filter: Filter): Promise<NostrEvent> {
        return (await this.getEvents(filter))[0]
    }

    async getEvents(filter: Filter): Promise<NostrEvent[]> {
        const events = await this.collectEventsFromRelay(filter)

        const latestItemsMap = new Map<string, NostrEvent>()

        if (events) {
            const sortedEvents =  events.sort((a: NostrEvent, b: NostrEvent) => b.created_at - a.created_at)

            for (const sortedEvent of sortedEvents) {
                const key = `${sortedEvent.tags}-${sortedEvent.kind}-${sortedEvent.npub}`
                if (!latestItemsMap.has(key)) {
                    latestItemsMap.set(key, sortedEvent)
                }
            }
        }

        return Array.from(latestItemsMap.values())
    }

    private async collectEventsFromRelay(filter: Filter) {
        const relay = this.relayList[0]
        await this.ensureConnected(relay)

        const events = []
        const subscription = relay.subscribe(
            [filter],
            {

                onevent(event) {
                    events.push(event)
                },
            },
        )

        let waitTime = 0
        while (this.timeoutMs >= waitTime) {
            waitTime += 10
            await sleep(10)
        }

        subscription.close()
        if(events.length == 0) {
            return undefined
        } else {
            return events
        }
    }

    async publish(event: NostrEvent) {
        const relay = this.relayList[0]
        await this.ensureConnected(relay)
        try {
            return await relay.publish(event)
        } catch (e) {
            console.log(e)
        }
    }

}

function formatRelayError(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }
    return String(error)
}
