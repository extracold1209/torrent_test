import express from 'express';
import routes from './routes';

const app = express();

app.use('/torrent', routes);

app.get('/l7check', (req, res) => {
    res.send('OK')
});

app.listen(8080, () => {
    console.log('server opened');
});
