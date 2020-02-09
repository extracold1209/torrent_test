import Peer, { PeerType } from './peer';
import { countBy } from 'lodash';

class Torrent {
    public readonly infoHash: string;
    private completeEventPeers = 0;
    private readonly peers: Peer[];

    constructor(infoHash: string) {
        this.infoHash = infoHash;
        this.peers = [];
    }

    addPeer(peer: Peer) {
        this.peers.push(peer);
    }

    removePeer(peer: Peer | string) {
        const targetPeerIndex = peer instanceof Peer
            ? this.peers.indexOf(peer)
            : this.peers.findIndex((targetPeer) => targetPeer.peerId === peer);

        if (targetPeerIndex > 0) {
            this.peers.splice(targetPeerIndex, 1);
        } else {
            console.warn('remove peer failed. peerId not exist in ' + this.infoHash);
        }
    }

    getPeerState() {
        const { complete, incomplete } = countBy(this.peers, (peer) => {
            if (peer.getPeerType() === PeerType.seeder) {
                return 'complete';
            } else if (peer.getPeerType() === PeerType.leecher) {
                return 'incomplete';
            } else {
                throw new Error('Peer type can not be seeder or leecher');
            }
        });

        return {
            complete: complete || 0,
            incomplete: incomplete || 0,
        }
    }

    getAllPeersDictionary() {
        return this.peers.map((peer) => peer.toDictionary()) || [];
    }

    increaseCompleteCount() {
        this.completeEventPeers++;
    }

    getCompleteCount() {
        return this.completeEventPeers;
    }
}

export default Torrent;
