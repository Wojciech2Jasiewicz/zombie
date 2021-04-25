import * as api from "../src/api"


describe("main", async () => {

    test("addZombie", async () => {

        let res = await api.addZombie("zombie1")
        res = await api.addZombie("zombie2")
        res = await api.addZombie("zombie3")
    })

    test("removeZombie", () => {

    })

    test("getZombie", () => {

    })

    test("getZombieItems", () => {

    })

    test("getZombieItem", () => {

    })

    test("getTotalValueOfZombieItems", () => {

    })

    test("addItemToZombie", () => {

    })

    test("removeItemToZombie", () => {

    })

})