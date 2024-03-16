import mongoose from "mongoose";

const commonConnectionOptions = {
    user: process.env.MONGO_USERNAME!,
    pass: process.env.MONGO_PASSWORD!,
    autoCreate: true,
    autoIndex: true,
}

export const approvalDB = mongoose.createConnection(
    process.env.MONGO_URL!, {
    ...commonConnectionOptions,
    dbName: process.env.APPROVAL_DB_NAME!
});

approvalDB.on('open', () => {
    console.log("Approval DB is up")
})

export const dexDB = mongoose.createConnection(
    process.env.MONGO_URL!, {
    ...commonConnectionOptions,
    dbName: process.env.DEX_DB_NAME!
});

dexDB.on('open', () => {
    console.log("DEX DB is up")
})

export const telegramDB = mongoose.createConnection(
    process.env.MONGO_URL!, {
    ...commonConnectionOptions,
    dbName: process.env.TELEGRAM_DB_NAME!
});

telegramDB.on('open', () => {
    console.log("Telegram DB is up")
})