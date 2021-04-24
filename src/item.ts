
import * as fs from "fs-extra"
import * as path from "path"
import * as a from "axios"
import * as util from "util"
import { listenerCount } from "node:events"

const money = ["PLN", "EU", "USD"]

interface rate {
    currency: string,
    code: string,
    bid: number,
    ask: number
}

export class Item {

    static list: Item[] = []
    static load() {
        // only a once per day
        Item.clear()
        const itemsObj = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/items.json")).toString())
        Item.list = itemsObj.items as Item[]
    }

    static clear() {
        Item.list = []
    }

    static get(id: number) {
        const res = Item.list.filter(x => x.id === id)
        if (res.length === 0) {
            throw Error(`Item ${id} doesn't exist`)
        }
        else {
            return res[0]
        }
    }

    // TODO add "today" at the end of url
    static async nbp(currencies: string[]) {
        const res = await a.default.get("http://api.nbp.pl/api/exchangerates/tables/C/")
        const data = res.data[0].rates as rate[]
        // console.log(`Typeof: ${typeof (data)} Array: ${Array.isArray(data)} Res: ${util.inspect(data, false, 7)}`)
        return data.filter(x => currencies.includes(x.code)).map(x => x.ask)
    }

    constructor(private id: number, private name: string, public price: number) {
        Item.list.push(this)
    }

}