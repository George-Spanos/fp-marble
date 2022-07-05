import { httpListener } from '@marblejs/http';
import { logger$ } from '@marblejs/middleware-logger';
import { bodyParser$ } from '@marblejs/middleware-body';
import { api$ } from './api.effects';

const middlewares = [
    logger$(),
    bodyParser$(),
    // middleware3$
    // middleware4$
    // ...
];

const effects = [
    api$,
    // endpoint2$
    // endpoint3$
    // ...
];

export const listener = httpListener({
    middlewares,
    effects,
});