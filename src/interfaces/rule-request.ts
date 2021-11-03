import { IPain001Message } from './iPain001';
import { Typology } from './network-map';

export class RuleRequest {
  transaction: IPain001Message;
  typologies: Array<Typology>;
  constructor(transaction: IPain001Message, typologies: Array<Typology>) {
    this.transaction = transaction;
    this.typologies = typologies;
  }
}
