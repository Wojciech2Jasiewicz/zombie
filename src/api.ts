
import * as axios from "axios"

const url = "localhost:5000"

export async function addZombie(name: string) {
    return await axios.default.put(`${url}/api/zombie`, { name: name })
}

export async function removeZombie(id: number) {
    return await axios.default.delete(`${url}/api/zombie/${id}`)
}

export async function getZombie(id: number) {
    return await axios.default.get(`${url}/api/zombie/${id}`)
}

export async function getZombieList(limit: number, offset: number) {
    return await axios.default.get(`${url}/api/zombie-list/?page=${limit}&size=${offset}`)
}

export async function addItemToZombie(zombieId: number, itemId: number) {
    return await axios.default.post(`${url}/api/zombie/${zombieId}/add/item/${itemId}`)
}

export async function removeItemFromZombie(zombieId: number, itemId: number) {
    return await axios.default.delete(`${url}/api/zombie/${zombieId}/add/item/${itemId}`)
}

export async function getItemFromZombie(zombieId: number, itemId: number) {
    return await axios.default.get(`${url}/api/zombie/${zombieId}/add/item/${itemId}`)
}

export async function getItemListFromZombie(zombieId: number) {
    return await axios.default.get(`${url}/api/zombie/${zombieId}/items`)
}

export async function getItemsTotalValueFromZombie(zombieId: number) {
    return await axios.default.get(`${url}/api/zombie/${zombieId}/items/totalvalue`)
}

