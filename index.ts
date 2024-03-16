import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import keySharingRouter from './src/apis/key-sharing';
import approvalRouter from './src/apis/approval';
import telegramUserRouter from './src/apis/telegram-user';
import rateLimit from 'express-rate-limit';
import accountNameRouter from './src/apis/account-name';

async function main() {
  const approvalPort = process.env.PORT || 6789;
  const approvalApp = express();

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 1000,
    validate: { xForwardedForHeader: false },
  });
  approvalApp.use(limiter);

  var corsOptions = {
    origin: [process.env.STATION_URL!, process.env.STAGING_STATION_URL!],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  };

  //approvalApp.use(cors());
  approvalApp.use(cors());
  approvalApp.use(bodyParser.json());

  approvalApp.use('/account-name', accountNameRouter);
  approvalApp.use('/key-sharing', keySharingRouter);
  approvalApp.use('/approval', approvalRouter);
  approvalApp.use('/telegram-user', telegramUserRouter);
  approvalApp.listen(approvalPort, () => {
    console.log(`Approval service is listening on port ${approvalPort}`);
  });
}

main();
