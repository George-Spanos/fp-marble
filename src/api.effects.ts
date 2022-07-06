import { HttpStatus, r } from '@marblejs/http';
import { fromIO, task } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import * as IO from 'fp-ts/lib/IO';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
interface Pet {
    id: string;
    walletAdress: string;
    name: string;
    type: string;
}

const api = `https://623a459cb5292b8bfcb33f6c.mockapi.io/`;
const fetchPets = TE.tryCatch(
    () => (fetch(api + 'Pets').then(response => {
        if (!response.ok) {
            throw response.statusText;
        };
        return response;
    })),
    (reason) => {
        if (typeof reason === 'string') {
            return new Error(reason as string);
        }
        return Error('error happened');
    },
);
const parsePetsResponse = (response: Response) => TE.tryCatch(
    () => response.json() as Promise<Pet[]>,
    (reason) => new Error(reason as string)
);
const getPets =
    pipe(fetchPets,
        TE.chain(parsePetsResponse),
        TE.chainFirstIOK((pets) => IO.of(console.log(pets))),
        TE.foldW(
            e => task.of({
                status: HttpStatus.INTERNAL_SERVER_ERROR, body: e.message
            })
            ,
            a => task.of({ status: HttpStatus.OK, body: a }))
    );
;
export const api$ = r.pipe(
    r.matchPath('/'),
    r.matchType('GET'),
    r.useEffect(req$ => {
        return req$.pipe(
            switchMap(req => pipe(getPets(), from)),
        );
    }));