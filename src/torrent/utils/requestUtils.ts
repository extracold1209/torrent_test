import { Request } from 'express';
import { TrackerRequestParams } from "../tracker";

const getIPv4FromRequest = (req: Request) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
    if (Array.isArray(ip)) {
        ip = ip[0];
    }

    const matchedIpv4 = ip.match(/(?:\d{1,3}\.?){4}/);
    return matchedIpv4 ? matchedIpv4[0] : ip;
};

const decodePartialHex = (hexString: string) => {
    const hex = hexString.toString();
    let str = '';
    for (let i = 0; i < hex.length; i++) {
        if (hex[i] === '%') {
            str += String.fromCharCode(parseInt(hex.substr(i + 1, 2), 16));
            i += 2;
        } else {
            str += hex[i];
        }
    }
    return str;
};

const decodePartialBencode = (infoHash: string) => {
    return unescape(infoHash)
        .split('')
        .map((e) => {
            const c = e.charCodeAt(0);
            return (c < 10 ? '0' : '') + c.toString(16).toUpperCase()
        })
        .join('');
};

const decodePeerId = (peerId: string) => {
    const matchResult = peerId.match(/(-\w{2}.{4}-)(.*)/);

    if (matchResult) {
        const prefixPeerId = matchResult[1];
        const randomString = decodePartialHex(matchResult[2]);

        return `${prefixPeerId}${randomString}`
    }
    return peerId.substr(0, 20);
};

const preProcessRequest: (req: Request) => TrackerRequestParams = (req: Request) => {
    const { info_hash, peer_id } = req.query;
    const ip = getIPv4FromRequest(req);
    const infoHash = decodePartialBencode(info_hash);
    const peerId = decodePeerId(peer_id);

    return Object.assign(req.query, { ip, info_hash: infoHash, peer_id: peerId });
};

export {
    decodePartialBencode,
    preProcessRequest,
}
