import { Router } from 'express';
import bencode from 'bencode';
import Tracker from '../torrent/tracker';

const tracker = new Tracker();
const router = Router();

const decodeInfohash = (infoHash: string) => {
    return unescape(infoHash)
        .split('')
        .map((e) => {
            const c = e.charCodeAt(0);
            return (c < 10 ? '0' : '') + c.toString(16).toUpperCase()
        })
        .join('');
};


router.get('/announce', (req, res) => {
    const { info_hash, peer_id, port, uploaded, downloaded, left, numwant, key, compact, supportcrypto, event } = req.query;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(ip);
    const response = tracker.announce(Object.assign(req.query, {info_hash: decodeInfohash(info_hash), ip}));
    console.log(response);
    res.send(bencode.encode(response));
});


router.get('/scrape', (req, res) => {
    console.log('scrape');
    res.send(bencode.encode({
        ['failure reason']: 'scrape failed'
    }));
});

/**
 var express = require('express');
 var router = express.Router();

 // middleware that is specific to this router
 router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});
 // define the home page route
 router.get('/', function(req, res) {
  res.send('Birds home page');
});
 // define the about route
 router.get('/about', function(req, res) {
  res.send('About birds');
});

 module.exports = router;
 */
export default router;
