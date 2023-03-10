import { registry } from 'tsyringe';
import { SYMBOLS } from '../constants/symbols';
import {
    DefaultController,
    GameController,
    UserController,
} from '../controllers';
import { CardController } from '../controllers/card-controller/card-controller';

@registry([
    { token: SYMBOLS.controller, useClass: DefaultController },
    { token: SYMBOLS.controller, useClass: GameController },
    { token: SYMBOLS.controller, useClass: CardController },
    { token: SYMBOLS.controller, useClass: UserController },
])
export class Registry {}
