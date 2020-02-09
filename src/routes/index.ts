import { Router } from 'express';
import bencode from 'bencode';
import Tracker, { decodeInfoHash } from '../torrent/tracker';

const tracker = new Tracker();
const router = Router();

router.get('/announce', (req, res) => {
    const { info_hash } = req.query;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const response = tracker.announce(Object.assign(req.query, { info_hash: decodeInfoHash(info_hash), ip }));
    res.send(bencode.encode(response));
});


router.get('/scrape', (req, res) => {
    const { info_hash } = req.query;
    const response = tracker.scrape(info_hash);
    res.send(bencode.encode(response));
});

export default router;
