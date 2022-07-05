import { HttpEffectResponse, HttpStatus, r } from '@marblejs/http';
import { task } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { Task } from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { from, Observable } from 'rxjs';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
interface Pet {
    id: string;
    walletAdress: string;
    name: string;
    type: string;
}

const api = `https://623a459cb5292b8bfcb33f6c.mockapi.io/`;

const fetchPets: Task<HttpEffectResponse> =
    pipe(TE.tryCatch(
        () => (fetch(api + 'Pets')),
        (reason) => new Error(reason as string)),
        TE.chain(response => TE.tryCatch(() => response.json() as Promise<Pet[]>,
            (reason => new Error(reason as string)))),
        TE.fold(e => task.of<HttpEffectResponse>({ status: 500, body: e }), a => task.of({ body: a }))
    );
;
export const api$ = r.pipe(
    r.matchPath('/'),
    r.matchType('GET'),
    r.useEffect(req$ => {
        return req$.pipe(
            switchMap(req => pipe(fetchPets(), from)),
            tap(console.log)
        );
    }));