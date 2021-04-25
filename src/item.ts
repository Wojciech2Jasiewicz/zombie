
import * as fs from "fs-extra"
import * as path from "path"
import axios, * as a from "axios"
import * as util from "util"
import * as moment from "moment"
const money = ["PLN", "EU", "USD"]

interface rate {
    currency: string,
    code: string,
    bid: number,
    ask: number
}
export class Item {
    static url: string = "https://zombie-items-api.herokuapp.com/api/items"
    static itemsDir: string = path.join(__dirname, "../data")
    static itemsPath: string = path.join(Item.itemsDir, "items.json")
    static list: Item[] = []
    static async load() {
        // only a once per day
        Item.clear()

        // creates directory if doesn't exist
        if (!fs.existsSync(Item.itemsDir)) {
            fs.mkdirSync(Item.itemsDir)
        }

        // loads items's list first time
        if (!fs.existsSync(Item.itemsPath)) {
            console.log("First Loading...")
            const res = await axios.get(Item.url)
            fs.writeFileSync(Item.itemsPath, JSON.stringify(res.data))
        }

        // reads items from file (for sync)
        const { items, timestamp } = JSON.parse(fs.readFileSync(Item.itemsPath).toString())
        console.log(`The last items' loading: ${moment.default(timestamp as number).format()}`)
        Item.list = items as Item[]

        const lastLoadingDate = moment.default(timestamp).date()
        const currentDate = moment.default().date()

        // reloads items's list if outdated
        if (currentDate > lastLoadingDate) {
            console.log("Loading...")
            const res = await axios.get(Item.url)
            fs.writeFileSync(Item.itemsPath, JSON.stringify(res.data))
            const { items, timestamp } = JSON.parse(fs.readFileSync(Item.itemsPath).toString())
            console.log(`The last items' loading: ${moment.default(timestamp as number).format()}`)
            Item.list = items as Item[]
        }
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

    constructor(public id: number, public name: string, public price: number) {
        Item.list.push(this)
    }

}