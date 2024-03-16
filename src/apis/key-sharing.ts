import { Router } from "express";
import { getSessionKey } from "../controllers/key-sharing";
import { getSalt } from "../controllers/salt";

const keySharingRouter = Router();

keySharingRouter.get("/", async function (req, res) {
    try {
        const { telegramId } = req.query
        const salt = await getSalt(+telegramId!);
        const { sessionPublicKey, signature } = await getSessionKey(+telegramId!, salt)
        res.status(200).json({ sessionPublicKey, signature, salt })
    } catch (err) {
        res.status(400).send((err as Error).message)
    }
})

export default keySharingRouter