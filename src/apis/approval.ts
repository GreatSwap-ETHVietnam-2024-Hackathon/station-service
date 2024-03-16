import { Router } from "express";
import { getApproval, updateApproval } from "../controllers/approval";
import { Approval } from "../types/approval";

const approvalRouter = Router();

approvalRouter.get("/", async (req, res) => {
    try {
        const { smartAccountsOwner, telegramId } = req.query;
        if (typeof telegramId !== 'string' || typeof smartAccountsOwner !== 'string')
            throw new Error("Invalid params")
        let approval: Approval;
        try {
            approval = await getApproval(+telegramId, smartAccountsOwner)
        } catch (err) {
            throw new Error("No account")
        }
        res.status(200).json(approval)
    } catch (err) {
        res.status(400).send((err as Error).message)
    }
})

approvalRouter.post("/", async (req, res) => {
    try {
        const { approval } = req.body;
        await updateApproval(approval);
        res.status(200).json('Approval updated!')
    } catch (err) {
        res.status(400).send((err as Error).message)
    }
})

export default approvalRouter