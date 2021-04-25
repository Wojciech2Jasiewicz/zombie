import express from 'express';
import { Item } from "./item"
import bodyParser from 'body-parser';
import { body, param, query, validationResult } from 'express-validator';
import * as moment from "moment"
import { Zombie } from './zombie';
import * as util from "util"

const app = express();
app.use(bodyParser.json())

async function wrapper(req: any, res: any, func: () => Promise<{ funcError: { msg: string, code: number } | undefined, funcResult: string }>) {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { funcError, funcResult } = await func()
        if (funcError !== undefined) {
            return res.status(funcError.code).send({ error: funcError.msg })
        }
        else {
            return res.status(200).send(funcResult)
        }

    } catch (error) {
        util.inspect(error)
        return res.status(500).send({ error: error.message })
    }
}

// gets all items for specific zombie
app.get("/api/zombie/:zombieId/items",
    [
        param("zombieId").notEmpty().isInt({ min: 1 })
    ],
    async (req: any, res: any) => {
        return await wrapper(req, res, async () => {
            const zId = new Number(req.params.zombieId).valueOf()
            if ((await Zombie.exist(zId)) === 0) {
                return {
                    funcError: { code: 400, msg: `Zombie: ${zId} doesn't exist` },
                    funcResult: "{}"
                }
            }
            return {
                funcError: undefined,
                funcResult: JSON.stringify(await Zombie.getAllItems(req.params.zombieId))
            }
        })
    })

// gets total value for all items of zobie
app.get("/api/zombie/:zombieId/items/totalvalue",
    [
        param("zombieId").notEmpty().isInt({ min: 1 })
    ],
    async (req: any, res: any) => {
        return await wrapper(req, res, async () => {
            const zId = new Number(req.params.zombieId).valueOf()
            const count = await Zombie.exist(zId)
            console.log(count)
            if (new Number(count).valueOf() === 0) {
                return {
                    funcError: { code: 400, msg: `Zombie: ${zId} doesn't exist` },
                    funcResult: "{}"
                }
            }
            return {
                funcError: undefined,
                funcResult: JSON.stringify(await Zombie.getTotalValueOfItems(zId))
            }
        })
    })

// add zombies item
app.post("/api/zombie/:zombieId/add/item/:itemId",
    [
        param("zombieId").notEmpty().isInt({ min: 1 }),
        param("itemId").notEmpty().isInt({ min: 1 }),
    ],
    async (req: any, res: any) => {
        return await wrapper(req, res, async () => {

            const { zombieId, itemId } = req.params
            const iId = new Number(itemId).valueOf()
            const zId = new Number(zombieId).valueOf()
            if (Item.list.find(x => x.id === iId) === undefined) {
                return {
                    funcError: { code: 400, msg: `Item: ${iId} doesn't exist` },
                    funcResult: "{}"
                }
            }

            const zombie = await Zombie.getZombie(zId)
            if (zombie === undefined) {
                return {
                    funcError: { code: 400, msg: `Zombie: ${zombieId} doesn't exist` },
                    funcResult: "{}"
                }
            }

            if (zombie.items.length === 5) {
                return {
                    funcError: { code: 400, msg: `Each zombie can have only 5 items` },
                    funcResult: "{}"
                }
            }

            if (zombie.items.map(x => x).includes(iId)) {
                return {
                    funcError: { code: 400, msg: `Zombie ${zId} already has item: ${iId}` },
                    funcResult: "{}"
                }
            }

            return {
                funcError: undefined,
                funcResult: JSON.stringify(await Zombie.addItem(zId, iId))
            }
        })
    })

// deletes a zombie's item
app.delete("/api/zombie/:zombieId/remove/item/:itemId",
    [
        param("zombieId").notEmpty().isInt({ min: 1 }),
        param("itemId").notEmpty().isInt({ min: 1 }),
    ],
    async (req: any, res: any) => {
        return await wrapper(req, res, async () => {
            const { zombieId, itemId } = req.params
            const iId = new Number(itemId).valueOf()
            const zId = new Number(zombieId).valueOf()

            const zombie = await Zombie.getZombie(zId)
            if (zombie === undefined) {
                return {
                    funcError: { code: 400, msg: `Zombie: ${zId} doesn't exist` },
                    funcResult: "{}"
                }
            }
            console.log(util.inspect(zombie.items))
            if (zombie.items.find(x => x === iId) === undefined) {
                return {
                    funcError: { code: 400, msg: `Zombie: ${zId} doesn't have item: ${iId}` },
                    funcResult: "{}"
                }
            }

            return {
                funcError: undefined,
                funcResult: JSON.stringify(await Zombie.removeItem(zId, iId))
            }
        })
    })

//deletes a zombie
app.delete("/api/zombie/:zombieId",
    [
        param("zombieId").notEmpty().isInt({ min: 1 })
    ],
    async (req: any, res: any) => {
        return await wrapper(req, res, async () => {
            const zId = new Number(req.params.zombieId).valueOf()
            const idObj = await Zombie.removeZombie(zId)
            let funcError = undefined
            if (idObj === undefined) {
                funcError = { code: 400, msg: `Zombie: ${zId} doesn't exist` }
            }
            return { funcError: funcError, funcResult: JSON.stringify(idObj) }
        })
    })

// updates a zombie
app.post("/api/zombie", [], (req: any, res: any) => {
    res.status(200).send("not implemented yet")
})

// adds a new zombie
app.put("/api/zombie",
    [
        body("name").notEmpty().isString()
    ],
    async (req: any, res: any) => {
        return wrapper(req, res, async () => {
            return {
                funcError: undefined,
                funcResult: JSON.stringify(await Zombie.addZombie(req.body.name))
            }
        })
    })

// gets info about specific zombie
app.get("/api/zombie/:zombieId",
    [
        param("zombieId").notEmpty().isInt({ min: 1 })
    ],
    async (req: any, res: any) => {
        return await wrapper(req, res, async () => {
            const zId = new Number(req.params.zombieId).valueOf()
            const zombie = await Zombie.getZombie(zId)
            let funcError = undefined
            if (zombie === undefined) {
                funcError = { code: 400, msg: `Zombie: ${zId} doesn't exist` }
            }
            return { funcError: funcError, funcResult: JSON.stringify(zombie) }
        })
    })


// gets the zombie's list
app.get("/api/zombie-list",
    [
        query("page").notEmpty().isInt({ min: 0 }),
        query("size").notEmpty().isInt({ min: 0 })
    ],
    async (req: any, res: any) => {
        return await wrapper(req, res, async () => {
            const { page, size } = req.query
            return {
                funcError: undefined,
                funcResult: JSON.stringify(await Zombie.list(page, size))
            }
        })
    })

app.listen(process.env.PORT || 5000, async () => {
    await Zombie.init()
    return console.log(`Zombie App is listening on ${(process.env.PORT || 5000)} `);
});

