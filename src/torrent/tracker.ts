import Torrent from "./torrent";
import Peer, { PeerDictionary } from "./peer";

enum PeerEvent {
    started = 'started',
    stopped = 'stopped',
    completed = 'completed',
}

type TrackerRequestParams = {
    info_hash: string;
    peer_id: string;
    port: string; // to be number
    uploaded: string; // amount of uploaded byte since 'started' peer event
    downloaded: string; // amount of downloaded byte since 'started' peer event
    left: string; // left bytes that peer will be 100% downloaded
    compact: '0' | '1';
    event: PeerEvent
    // no_peer_id?: '0' | '1';
    ip: string; // draft is optional, but express will inject that
    numwant?: string; // to be number. amount of peers that client want to get
    key?: string; // peer identification
    trackerid?: string; // previous tracker id
}

type TrackerResponseParams = {
    'warning message'?: string;
    interval: number;
    'min interval'?: number;
    'tracker id': string;
    complete: number;
    incomplete: number;
    peers: PeerDictionary[];
}

type TrackerFailResponseParams = {
    'failure reason': string;
}


class Tracker {
    private trackerId: string = 'helloWorldTestTracker';
    private readonly torrentSwarm: { [infoHash: string]: Torrent };

    constructor() {
        this.torrentSwarm = {};
    }

    public announce(request: TrackerRequestParams) {
        const { info_hash } = request;

        const torrent = this.getOrCreateTorrent(info_hash);
        this.handlePeerEvent(torrent, request);
        return this.generateTrackerResponse(torrent);
    }

    private getOrCreateTorrent(infoHash: string) {
        if (this.torrentSwarm[infoHash]) {
            return this.torrentSwarm[infoHash];
        } else {
            const torrent = new Torrent(infoHash);
            this.torrentSwarm[infoHash] = torrent;
            return torrent;
        }
    }

    private handlePeerEvent(torrent: Torrent, request: TrackerRequestParams) {
        const {event, peer_id, ip, port, left, info_hash} = request;

        switch(event) {
            case PeerEvent.started:
                torrent.addPeer(new Peer(peer_id, ip, port, left));
                break;
            case PeerEvent.stopped:
                torrent.removePeer(peer_id);
                break;
            case PeerEvent.completed:
                console.log(`PeerId[${peer_id}], infoHash[${info_hash}] is completed`);
                break;
        }
    }

    private generateTrackerResponse(torrent: Torrent): TrackerResponseParams {
        const result = torrent.getPeerState();
        const { complete = 0, incomplete = 0 } = result;
        const peers = torrent.getAllPeersDictionary();
        const interval = 30;

        return {
            interval,
            'tracker id': this.trackerId,
            complete,
            incomplete,
            peers
        }
    }

}

export default Tracker;
