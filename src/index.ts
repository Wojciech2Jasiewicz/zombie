import express from 'express';
import { Item } from "./item"
import bodyParser from 'body-parser';
import { body, check, checkSchema, param, query, validationResult } from 'express-validator';
import { AmdDependency } from 'typescript';
import * as util from "util"
import { Client as pgClient, ClientConfig, FieldDef } from "pg"
import { join } from 'node:path';
import * as fs from 'fs-extra';
import * as path from "path"

const app = express();
app.use(bodyParser.json())

const dbClient = new pgClient({
    user: "user",
    password: "docker",
    database: "user",
    port: 5432,
    host: "db"
})

// gets info about specific zombie
app.get("/zombie/:zombieId",
    [
        param("zombieId").notEmpty().isString()
    ],
    async (req: any, res: any) => {
        try {

            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }

            const dbRes = await dbClient.query("SELECT * FROM zombies WHERE ID=$1", [req.params.zombieId])
            let zombie = dbRes.rows[0]
            return res.status(200).send(JSON.stringify(zombie))
        } catch (err) {
            return res.status(500).send({ error: err })
        }
    })

// gets all items for specific zombie
app.get("/zombie/:zombieId/items",
    [
        param("zombieId").notEmpty().isString()
    ],
    async (req: any, res: any) => {
        try {

            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }

            const dbRes = await dbClient.query("SELECT ITEMS FROM zombies WHERE ID=$1", [req.params.zombieId])
            const items = dbRes.rows[0].items as number[]
            return res.status(200).send(JSON.stringify(items.map(id => Item.get(id))))
        }
        catch (err) {
            return res.status(500).send({ error: err })
        }
    })

// gets total value for all items of zobie
app.get("/zombie/:zombieId/items/totalvalue",
    [
        param("zombieId").notEmpty().isInt()
    ],
    async (req: any, res: any) => {
        try {

            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }

            const dbRes = await dbClient.query("SELECT ITEMS FROM zombies WHERE ID=$1", [req.params.zombieId])
            const items = dbRes.rows[0].items as number[]
            if (items.length > 0) {
                const [usd, eur] = await Item.nbp(["USD", "EUR"])
                const pln = items.map(id => Item.get(id).price).reduce((pv, cv) => pv + cv)
                return res.status(200).send({ totlavalue: { pln: pln, usd: pln * usd, eur: pln * eur } })
            }
            else {
                return res.status(200).send({ totlavalue: { pln: 0, usd: 0, eur: 0 } })
            }

        }
        catch (err) {
            return res.status(500).send({ error: err })
        }
    })

// add zombies item
app.post("/zombie/:zombieId/add/item/:itemId",
    [
        param("zombieId").notEmpty().isInt(),
        param("itemId").notEmpty().isInt(),
    ],
    async (req: any, res: any) => {
        try {

            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }

            console.log(`add item ${req.params.itemId} to ${req.params.zombieId}`)
            const query = "UPDATE zombies SET ITEMS = array_append(ITEMS, $2) WHERE ID=$1 RETURNING ITEMS"
            const items = (await dbClient.query(query, [req.params.zombieId, req.params.itemId])).rows[0]
            console.log(`${util.inspect(items)}`)
            let arr = items.items as number[]
            return res.status(200).send(JSON.stringify(arr.map(id => Item.get(id))))
        }
        catch (err) {
            console.log(`Err: ${err}`)
            return res.status(500).send({ error: err })
        }

    })

// deletes a zombie's item
app.delete("/zombie/:zombieId/remove/item/:itemId",
    [
        param("zombieId").notEmpty().isInt(),
        param("itemId").notEmpty().isInt(),
    ],
    async (req: any, res: any) => {
        try {

            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }

            const query = "UPDATE zombies SET ITEMS = array_remove(ITEMS, $2) WHERE ID=$1 RETURNING ITEMS"
            const items = (await dbClient.query(query, [req.params.zombieId, req.params.itemId])).rows[0]
            console.log(`${util.inspect(items)}`)
            let arr = items.items as number[]
            return res.status(200).send(JSON.stringify(arr.map(id => Item.get(id))))
        }
        catch (err) {
            return res.status(500).send({ error: err })
        }
    })

//deletes a zombie
app.delete("/zombie/:zombieId",
    [
        param("zombieId").notEmpty().isInt()
    ],
    async (req: any, res: any) => {
        try {

            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }

            let { id } = req.params
            console.log(`Delete zombie: ${id}`)
            await dbClient.query("DELETE FROM zombies WHERE ID=$1", [req.params.id])
            res.send("ok")
        }
        catch (err) {
            return res.status(500).send({ error: err })
        }
    })

// updates a zombie
app.post("/zombie", [], (req: any, res: any) => { })

// adds a new zombie
app.put("/zombie",
    [
        body("name").notEmpty().isString()
    ],
    async (req: any, res: any) => {

        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        try {



            let dbRes = await dbClient.query(
                "INSERT INTO zombies(NAME, CREATIONDATE, ITEMS) Values($1, $2, $3)",
                [req.body.name, "2020-05-20 13:02:52.281964", []])

            res.send("ok")
        }
        catch (err) {
            return res.status(500).send({ error: err })
        }
    })

// gets the zombie's list
app.get("/zombie-list",
    [
        query("limit").notEmpty().isInt(),
        query("offset").notEmpty().isInt()
    ],
    async (req: any, res: any) => {
        try {

            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }

            const { limit, offset } = req.query
            const dbRes = await dbClient.query("SELECT * FROM zombies LIMIT $1 OFFSET $2", [limit, offset])
            res.send(JSON.stringify(dbRes.rows))
        } catch (err) {
            return res.status(500).send({ error: err })
        }
    })

app.listen(process.env.PORT || 5000, async () => {
    await dbClient.connect()
    Item.load()
    return console.log(`Zombie App is listening on ${(process.env.PORT || 5000)} `);
});

