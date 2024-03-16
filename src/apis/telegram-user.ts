import { Router } from "express";
import { getTelegramUser } from "../controllers/telegram-user";

const telegramUserRouter = Router();

telegramUserRouter.get("/", async (req, res) => {
    try {
        const { telegramId } = req.query;
        if (typeof telegramId !== 'string')
            throw new Error("Invalid params")
        const user = await getTelegramUser(+telegramId)
        res.status(200).json(user)
    } catch (err) {
        res.status(400).send((err as Error).message)
    }
})

export default telegramUserRouter;