import * as moment from "moment"
import { Client as pgClient, ClientConfig, FieldDef } from "pg"
import * as util from "util"
import { Item } from "./item"

export class Zombie {

    static async init() {
        Zombie.dbClient = new pgClient({
            user: "user",
            password: "docker",
            database: "user",
            port: 5432,
            host: "db"
        })

        await Zombie.dbClient.connect()

        // checks Items every hour
        await Item.load()
        setInterval(async () => {
            return await Item.load()
        }, 3600000)
    }

    static dbClient: pgClient = null as any


    cretionDate: number
    items: Item[]
    constructor(private name: string, private id: number) {
        this.cretionDate = moment.default().valueOf()
        this.items = []
    }

    static async getAllItems(zombieId: number) {
        const dbRes = await Zombie.dbClient.query("SELECT ITEMS FROM zombies WHERE ID=$1", [zombieId])
        const items = dbRes.rows[0].items as number[]
        return items.map(id => Item.get(id))
    }

    static async getTotalValueOfItems(zombieId: number) {
        const dbRes = await Zombie.dbClient.query("SELECT ITEMS FROM zombies WHERE ID=$1", [zombieId])
        const items = dbRes.rows[0].items as number[]
        if (items.length > 0) {
            const [usd, eur] = await Item.nbp(["USD", "EUR"])
            const pln = items.map(id => Item.get(id).price).reduce((pv, cv) => pv + cv)
            return {
                totlavalue: { pln: pln, usd: pln * usd, eur: pln * eur }
            }
        }
        else {
            return { totlavalue: { pln: 0, usd: 0, eur: 0 } }
        }
    }

    static async exist(zombieId: number) {
        const { count } = (await Zombie.dbClient.query("SELECT COUNT(*) FROM zombies WHERE ID=$1", [zombieId])).rows[0]
        return new Number(count).valueOf()
    }

    static async addItem(zombieId: number, itemId: number) {
        console.log(`add item ${itemId} to ${zombieId}`)
        const query = "UPDATE zombies SET ITEMS = array_append(ITEMS, $2) WHERE ID=$1 RETURNING ITEMS"
        const items = (await Zombie.dbClient.query(query, [zombieId, itemId])).rows[0]
        console.log(`${util.inspect(items)}`)
        const arr = items.items as number[]
        return arr.map(id => Item.get(id))
    }

    static async removeItem(zombieId: number, itemId: number) {
        const query = "UPDATE zombies SET ITEMS = array_remove(ITEMS, $2) WHERE ID=$1 RETURNING ITEMS"
        const items = (await Zombie.dbClient.query(query, [zombieId, itemId])).rows[0]
        console.log(`${util.inspect(items)}`)
        const arr = items.items as number[]
        return arr.map(id => Item.get(id))
    }

    static async addZombie(name: string) {
        let dbRes = await Zombie.dbClient.query(
            "INSERT INTO zombies(NAME, CREATIONDATE, ITEMS) Values($1, $2, $3) RETURNING ID",
            [name, moment.default().format(), []])
        console.log(`${util.inspect(dbRes.rows[0])}`)
        return dbRes.rows[0]
    }

    static async getZombie(zombieId: number) {
        const dbRes = await Zombie.dbClient.query("SELECT * FROM zombies WHERE ID=$1", [zombieId])
        return dbRes.rows[0] as { id: number, name: string, items: number[], creatoindate: string }
    }

    static async removeZombie(zombieId: number) {
        return (await Zombie.dbClient.query("DELETE FROM zombies WHERE ID=$1 RETURNING ID", [zombieId])).rows[0]
    }

    static async list(page: number, size: number) {
        const { count } = (await Zombie.dbClient.query("SELECT COUNT(*) FROM zombies")).rows[0]
        console.log(`Number of zombies: ${util.inspect(count)}`)
        const offset = page * size
        const dbRes = await Zombie.dbClient.query("SELECT * FROM zombies LIMIT $1 OFFSET $2", [size, offset])
        return { numberOfAll: count, zombies: dbRes.rows }
    }

}