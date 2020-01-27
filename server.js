const express = require('express');
const app = new express();

app.use((req, res) => {
    const { info_hash, peer_id, port, uploaded, downloaded, left, numwant, key, compact, supportcrypto, event } = req.params;




    res.send('OK');
});

app.listen(8080, () => {
    console.log('server opened');
});
