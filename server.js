const express = require('express');
const bencode = require('bencode');
const app = new express();

app.use((req, res) => {
    const { info_hash, peer_id, port, uploaded, downloaded, left, numwant, key, compact, supportcrypto, event } = req.params;


    res.send(bencode.encode({
        ['failure reason']: 'because I Love You'
    }));
});

app.listen(8080, () => {
    console.log('server opened');
});
