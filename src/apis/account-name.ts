import { Router } from "express";
import { getNames } from "../controllers/account-name";

const accountNameRouter = Router();

accountNameRouter.get("/", async function (req, res) {
    try {
        const {
            smartAccountsOwner,
            smartAccounts
        } = req.query
        //@ts-ignore
        const accountNames = await getNames(smartAccountsOwner, smartAccounts);
        res.status(200).json(accountNames)
    } catch (err) {
        res.status(400).send((err as Error).message)
    }
})

export default accountNameRouter