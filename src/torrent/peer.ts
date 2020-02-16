/**
 * info_hash = foo
 * peer_id = foofoo
 * port = numberString
 * uploaded = numberString how many this peer upload to this file (since started event)
 * downloaded = numberString how many this peer downloaded this file (since started event)
 * numwant = numberString how many this peer want to receive peer list
 * key = id
 * event = 'started', 'stopped', 'completed'
 *
 */

export enum PeerType {
    seeder,
    leecher
}

export type PeerDictionary = {
    'peer id': string,
    ip: string,
    port: number,
}

class Peer {
    private peerType: PeerType = PeerType.leecher;
    public readonly peerId: string;
    public readonly ip: string;
    public readonly port: number;
    public left: number;

    constructor(peerId: string, ip: string, port: string, left: string){
        this.peerId = peerId;
        this.ip = ip;
        this.port = parseInt(port);
        this.left = parseInt(left);
        this.setPeerType();
    }

    public setPeerType(type?: PeerType) {
        if (type) {
            this.peerType = type;
        } else {
            this.peerType = this.left > 0 ? PeerType.leecher : PeerType.seeder;
        }
    }

    public getPeerType() {
        return this.peerType;
    }

    public toDictionary(): PeerDictionary {
        return {
            ['peer id']: this.peerId,
            ip: this.ip,
            port: this.port,
        }
    }
}

export default Peer;
