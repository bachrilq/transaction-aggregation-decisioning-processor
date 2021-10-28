import { Context, Next } from 'koa';
import { handleChannels } from '../services/app.service';
import { LoggerService } from '../helpers';
import { ChannelResult } from '../interfaces/channel-result';
import { IPain001Message } from '../interfaces/iPain001';
import { NetworkMap } from '../interfaces/network-map';
import { RuleResult } from '../interfaces/rule-result';
import { TypologyResult } from '../interfaces/typology-result';

/**
 * Handle the incoming request and return the result
 * @param ctx default koa context
 * @param next default koa next
 * @returns Koa context
 */
export const handleExecute = async (ctx: Context, next: Next): Promise<Context> => {
  try {
    // Get the request body and parse it to variables
    const transaction = ctx.request.body.transaction as IPain001Message;
    const networkMap = ctx.request.body.networkMap as NetworkMap;
    const ruleResult = ctx.request.body.ruleResults as RuleResult[];
    const typologyResult = ctx.request.body.typologyResult as TypologyResult;
    const channelResult = ctx.request.body.channelResult as ChannelResult;

    const transactionId = transaction.CstmrCdtTrfInitn.PmtInf.CdtTrfTxInf.PmtId.EndToEndId;

    // Send every channel request to the service function
    let channelCounter = 0;
    const toReturn = [];

    const pain001Message = networkMap.messages.find((tran) => tran.txTp === 'pain.001.001.11');

    for (const channel of pain001Message!.channels) {
      channelCounter++;

      const channelRes = await handleChannels(ctx, transaction, networkMap, ruleResult, typologyResult, channelResult, channel);

      toReturn.push(`{"Channel": ${channel.id}, "Result":{${channelRes}}}`);
    }

    const result = {
      transactionId: transactionId,
      message: `Successfully ${channelCounter} channels completed`,
      result: toReturn,
    };

    ctx.body = result;
    ctx.status = 200;
    await next();
    return ctx;
  } catch (e) {
    LoggerService.error('Error while calculating Transaction score', e as Error);
    ctx.status = 500;
    ctx.body = e;
  }
  return ctx;
};
