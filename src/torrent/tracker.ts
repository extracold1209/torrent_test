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

export const decodeInfoHash = (infoHash: string) => {
    return unescape(infoHash)
        .split('')
        .map((e) => {
            const c = e.charCodeAt(0);
            return (c < 10 ? '0' : '') + c.toString(16).toUpperCase()
        })
        .join('');
};

class Tracker {
    private TRACKER_ID: string = 'helloWorldTestTracker';
    private TRACKER_ANNOUNCE_INTERVAL: number = 30;

    private readonly torrentSwarm: { [infoHash: string]: Torrent };

    constructor() {
        this.torrentSwarm = {};
    }

    public announce(request: TrackerRequestParams) {
        const { info_hash } = request;

        const failResponse = this.validateRequest(request);
        if (failResponse) {
            return failResponse;
        }

        const torrent = this.getOrCreateTorrent(info_hash);
        this.handlePeerEvent(torrent, request);
        return this.generateTrackerResponse(torrent);
    }

    private validateRequest(request: TrackerRequestParams): TrackerFailResponseParams | undefined {
        if (!request.ip){
            return this.generateTrackerFailResponse('IP not found');
        }
        if (!request.info_hash || request.info_hash.length !== 20) {
            return this.generateTrackerFailResponse('invalid info_hash');
        }
        if (!request.peer_id || request.peer_id.length !== 20) {
            return this.generateTrackerFailResponse('invalid peer_id');
        }
        if (!request.port) {
            return this.generateTrackerFailResponse('invalid port');
        }
    }

    private getOrCreateTorrent(decodedInfoHash: string) {
        if (this.torrentSwarm[decodedInfoHash]) {
            return this.torrentSwarm[decodedInfoHash];
        } else {
            const torrent = new Torrent(decodedInfoHash);
            this.torrentSwarm[decodedInfoHash] = torrent;
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

        return {
            interval: this.TRACKER_ANNOUNCE_INTERVAL,
            'tracker id': this.TRACKER_ID,
            complete,
            incomplete,
            peers
        }
    }

    private generateTrackerFailResponse(errorMessage: string): TrackerFailResponseParams {
        return {
            'failure reason': errorMessage,
        }
    }
}

export default Tracker;
