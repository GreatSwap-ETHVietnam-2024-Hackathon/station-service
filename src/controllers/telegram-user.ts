import TelegramUserModel from "../models/telegram-user";

export async function getTelegramUser(telegramId: number) {
    return await TelegramUserModel.findOne({ telegramId });
}