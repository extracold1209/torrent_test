import { Router } from 'express';
import bencode from 'bencode';
import Tracker from '../torrent/tracker';
import {preProcessRequest} from "../torrent/utils/requestUtils";

const tracker = new Tracker();
const router = Router();

router.get('/announce', (req, res) => {
    preProcessRequest(req);
    const response = tracker.announce(req.query);
    res.send(bencode.encode(response));
});


router.get('/scrape', (req, res) => {
    const { info_hash } = req.query;
    const response = tracker.scrape(info_hash);
    res.send(bencode.encode(response));
});

export default router;
