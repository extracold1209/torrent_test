import Peer, { PeerType } from './peer';
import { countBy } from 'lodash';
import debug from 'debug';

let log = debug('Torrent');

class Torrent {
    public readonly infoHash: string;
    private completeEventPeers = 0;
    private readonly peers: Peer[];

    constructor(infoHash: string) {
        this.infoHash = infoHash;
        this.peers = [];
        log = log.extend(infoHash);
    }

    addPeer(peer: Peer) {
        const existPeerIndex = this.peers.findIndex((prevPeer) => prevPeer.peerId === peer.peerId);
        if (existPeerIndex >= 0) {
            log('peer update | index %d | peer_id : %s | %s',
                existPeerIndex,
                peer.peerId,
                `${peer.ip}:${peer.port}`
            );
            this.peers[existPeerIndex] = peer
        } else {
            log('peer added | peer_id : %s | %s', peer.peerId, `${peer.ip}:${peer.port}`);
            this.peers.push(peer);
        }
    }

    removePeer(peer: Peer | string) {
        const targetPeerIndex = this.getPeerIndex(peer);

        if (targetPeerIndex >= 0) {
            log('peer removed | peer_id : %s', peer instanceof Peer ?
                peer.peerId : peer
            );
            this.peers.splice(targetPeerIndex, 1);
        } else {
            console.warn('remove peer failed. peerId not exist in ' + this.infoHash);
        }
    }

    completePeer(peer: Peer) {
        const targetPeerIndex = this.getPeerIndex(peer);
        log(`PeerId[${peer.peerId}] download is completed`);
        if (targetPeerIndex >= 0) {
            this.peers[targetPeerIndex].setPeerType(PeerType.seeder);
        } else {
            log('%s peer completed but not in swarm. add peer', peer.peerId);
            peer.setPeerType(PeerType.seeder);
            this.addPeer(peer);
        }
        this.increaseCompleteCount();
    }

    private getPeerIndex(peer: Peer | string) {
        return peer instanceof Peer
            ? this.peers.indexOf(peer)
            : this.peers.findIndex((targetPeer) => targetPeer.peerId === peer);
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

    private increaseCompleteCount() {
        this.completeEventPeers++;
    }

    getCompleteCount() {
        return this.completeEventPeers;
    }
}

export default Torrent;
