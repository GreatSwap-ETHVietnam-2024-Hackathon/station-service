import TelegramSaltModel from "../models/salt";

export async function getSalt(telegramId: number) {
    const telegramSalt = await TelegramSaltModel.findOne({ telegramId })
    return telegramSalt ? telegramSalt.salt : 0
}

export async function setSalt(telegramId: number, salt: number) {
    await TelegramSaltModel.updateOne({
        telegramId
    }, {
        $set: { salt }
    }, {
        upsert: true
    })
}