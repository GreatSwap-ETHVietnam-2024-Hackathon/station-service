import AccountNameListModel from "../models/account-name";

export async function getNames(smartAccountsOwner: string, smartAccounts: string[]) {
    const nameListModel = await AccountNameListModel.findOne({ smartAccountsOwner })
    if (!nameListModel) return smartAccounts.map(smartAccount => ({
        smartAccount,
        name: undefined
    }));
    return smartAccounts.map(smartAccount => nameListModel.nameList.find(a => a.smartAccount === smartAccount) ?? {
        smartAccount,
        name: undefined
    })
}

export async function getAllNamesOfOwner(smartAccountsOwner: string) {
    const nameListModel = await AccountNameListModel.findOne({ smartAccountsOwner })
    return nameListModel?.nameList ?? []
}

export async function setWalletName(smartAccountsOwner: string, smartAccount: string, newName: string) {

    let nameListModel = await AccountNameListModel.findOne({ smartAccountsOwner })
    if (!nameListModel) {
        nameListModel = new AccountNameListModel({
            smartAccountsOwner,
            nameList: [
                {
                    smartAccount,
                    name: newName
                }
            ]
        })
        await nameListModel.save();
        return;
    }
    const index = nameListModel.nameList.findIndex(item => item.smartAccount === smartAccount)
    if (index === -1) {
        nameListModel.nameList.push({ smartAccount, name: newName })
    } else {
        nameListModel.nameList[index].name = newName;
    }
    await AccountNameListModel.updateOne({
        smartAccountsOwner
    }, {
        $set: {
            nameList: nameListModel.nameList
        }
    }, {
        upsert: true
    })
}