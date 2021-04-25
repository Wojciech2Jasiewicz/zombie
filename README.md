# zombie
This is a zombie api

# setup



# endpoints

## Gets the list of zombies
1. BASE_URL: `localhost:5000`
2. PATH: `/api/zombie-list`
3. METHOD: GET
4. QUERY PARAMS:
    - page: index of a selected page size
    - size: number of elements in a page
5. RETURN: {nubmberOffAll: number, zombies: listOfzombies}
6. Results:
    - 200: everything is okay
    - 400: validation error
    - 500: internal server error
7. Example:
```
// request
localhost:5000/api/zombie-list?page=0&size=10
```
```json
// output
 {"numberOfAll":"2","zombies":[{"id":4,"name":"zombie3
","creationdate":"2020-05-20T13:02:52.281Z","items":[]},{"id":75,"name":"zombie1
","creationdate":"2021-04-25T12:50:54.000Z","items":[8]}]}
```

## Gets info about a specific zombie
1. BASE_URL: `localhost:5000`
2. PATH: `/api/zombie/:zombieId`
3. METHOD: GET
4. PARAMS:
    - zombieId: is an uniqe id of a zombie
5. RETURN: Zombie object
6. RESULTS:
    - 200: Everything is okay
    - 500: Internal server error
    - 400: Validation error or ```  {
    "error": "Zombie: zombieId doesn't exist"
}```
7. EXAMPLE:
```
// request
localhost:5000/api/zombie/75
```

```json
{"id":75,"name":"zombie1 ","creationdate":"2021-04-25T12:50:54.000Z","items":[8]}
```

## Adds a new zombie
1. BASE_URL: `localhost:5000`
2. PATH: `/api/zombie`
3. METHOD: PUT
4. PARAMS: -
5. BODY: ``` {
    "name":"zombieName"
} ```
6. RESULTS:
 - 200: Everything is okay ``` {"id":idOfNewZombie}```
 - 500: Internal server error

7. EXAMPLES:
```
// request
localhost:5000/api/zombie

// body
{
    "name":"zombie1"
}
```

```json
{"id":75}
```

## Remove a zombie
1. BASE_URL: `localhost:5000`
2. PATH: `/api/zombie`
3. METHOD: DELETE
4. PARAMS: zombieId: a unique id of an existing zombie
6. RESULTS:
 - 200: Everything is okay ``` {"id":idOfNewZombie}```
 - 400: Validation error or a zombie doesn't exist
 - 500: Internal server error

7. EXAMPLES:
```
// request
localhost:5000/api/zombie/75
```

```json
// output
{"id":75}
```
##

## Gets all items from Zombie

## Removes an item from a specific zombie

## Adds an item to a specific zombie

## Gets one item from a specific zombie

## Gets total value of item from a specific zombie
