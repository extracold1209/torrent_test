import express from 'express';
import routes from './routes';
import debug from 'debug';
import { AddressInfo } from "net";

const log = debug('index');

const app = express();

app.use('/torrent', routes);

app.get('/l7check', (req, res) => {
    res.send('OK')
});

app.get('*', (req, res) => {
    log(req);
    res.send('hello?');
});

const server = app.listen(8080, () => {
    const { address, port } = server.address() as AddressInfo;
    log('Server now listening. port %s:%s', address, port);
});
