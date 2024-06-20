## API Documentation

### Rooms

#### <summary><code>POST</code> <code><b>/floors/create</b></code> <code>(Create a new floor plan / floor map)</code></summary>

##### Request Body

```json
{
    "floor": {
        "name": string,
        "level": string
    },
    "type": "Feature Collection",
    "features": {
        "type": "Feature",
        "properties": {
            "name": string,
            "poi": [number, number], // lat-long format, NOT x-y
            "category": "room" / "corridor",
            "id": number // optional and will be ignored for this feature
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [number, number][][] /* coordinates[0]
            returns the list of coordinates that binds a room*/
        }
    }[]
}
```

##### Responses

- 200 (OK)
- 400 (Bad Request), 404 (Not Found), 500 (Internal Server Error)

```json
{
    "error": {
        "status": number, // 400, 404, 500,
        "message": string // example: Floor level does not exist
    }
}
```

#### <summary><code>POST</code> <code><b>/floors/{floorId}/edit</b></code> <code>(Overwrite an existing floor plan / floor map)</code></summary>

##### Request Body

```json
{
    "floor": {
        "name": string,
        "level": string
    },
    "type": "Feature Collection",
    "features": {
        "type": "Feature",
        "properties": {
            "name": string,
            "poi": [number, number], // lat-long format, NOT x-y
            "category": "room" / "corridor",
            "id": number /* Rooms with id will edit,
            Rooms without id will be created,
            Rooms in DB not found in request body will be deleted */
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [number, number][][] /* Will NOT change bounds in database,
            please delete then create the room again */
        }
    }[]
}
```

##### Responses

- 200 (OK)
- 400 (Bad Request), 404 (Not Found), 500 (Internal Server Error)

```json
{
    "error": {
        "status": number, // 400, 404, 500,
        "message": string // example: Unknown Error Occured
    }
}
```

#### <summary><code>DELETE</code> <code><b>/floors/{floorId}</b></code> <code> (Delete an existing floor plan / floor map)</code></summary>

##### Responses

- 200 (OK)
- 400 (Bad Request), 404 (Not Found), 500 (Internal Server Error)

```json
{
    "error": {
        "status": number, // 400, 404, 500,
        "message": string // example: Floor level exists
    }
}
```

#### <summary><code>GET</code> <code><b>/floors/{floorId}</b></code> <code> (Get map data of a floor)</code></summary>

##### Path Parameters

- floorId - [int] - id of floor that is requested

##### Responses

- 200 (OK)

```json
{
    "floor": {
        "name": string,
        "id": int,
        "level": int,
        "maxX": float,
        "maxY": float
    },
    "geojson": {
        "type": "Feature Collection",
        "features": {
          "type": "Feature",
          "properties": {
            "name": string,
            "poi": [float, float],
            "category": "room" / "corridor",
            "id": number
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [number, number][][] /* coordinates[0]
            returns the list of coordinates that binds a room*/
          }
        },[]
    }
}
```

- 404 (Not Found)

```json
{
  "error": {
    "status": 404,
    "message": "Floor Id Does Not Exist"
  }
}
```

#### <summary><code>GET</code> <code><b>/floors/short</b></code> <code>(Get short information of all floors)</code></summary>

##### Response

- 200 (OK)

```json
{
    "id": number,
    "name": string,
    "level": number
}[]
```

- 500 (Internal Server Error)

```json
{
  "error": {
    "status": 500,
    "message": "An unknown error occurred"
  }
}
```

### Access Points

#### <summary><code>POST</code><code><b>/aps/{floorId}/edit</b></code><code>(Overwrite List of AP in a floor )</code></summary>

##### Path Parameters

- floorId - [int] - id of floor that the list of AP is going to be overwritten

##### Request Body

```json
{
    "type": "FeatureCollection",
    "features": {
        "type": "Feature",
        "properties": {
            "spaceId": number, // id of room that an AP is located
            "bssids": {"bssid": string, "ssid": string}[],
            "description": string, // optional, if empty will default to '-'
            "id": number /* AP with id will be edited,
            AP with no id will be created,
            AP in DB for this floor that is not in this request body will be deleted */
        },
        "geometry": {
            "type": "Point",
            "coordinates": [number, number] // lat-long format, NOT x-y
        }
    }[]
}
```

##### Responses

- 200 (OK)
- 400 (Bad Request), 404 (Not Found), 500 (Internal Server Error)

```json
{
    "error": {
        "status": number, // 400, 404, 500,
        "message": string // example: Floor level does not exist
    }
}
```

#### <summary><code>GET</code><code><b>/aps</b></code> <code>(Get all access points in table format)</code></summary>

##### Responses

- 200 (OK)

```json
{
    "key": number, // simple index starting from 1
    "floor": {
        "id": number,
        "name": string,
        "level": number,
        "apTotal": number // total number of access point in that floor
    },
    "locationName": string, /* APs are not ordered,
    but APs with similar rooms and similar floors are grouped together */
    "description": string // '-' if empty
}[]
```

- 500 (Internal Server Error)

```json
{
  "error": {
    "status": 500,
    "message": "An unknown error occurred"
  }
}
```

#### <summary><code>GET</code> <code><b>/aps/{floorId}</b></code> <code>(Get all access point in a floor in requested format)</code></summary>

##### Path Parameter

- floorId - [int] - id of floor to get access points from

##### Query Parameter

- type - [string] - type of format

  - table (default)
  - geojson

##### Responses

- 200 (OK)

  - table

  ```json
  {
      "floorName": string,
      "bssids": {
        "key": number, // simple index, start from 1
        "apInfo": {
            "id": number,
            "locationName": string, // name of room that has AP
            "description": string, // '-' if empty
            "bssidTotal": number // total networks that an AP has
        },
        "ssid": string,
        "bssid": string
      }[]
  }
  ```

  - geojson

  ```json
    {
        "floor": {
            "id": number,
            "name": string
        },
        "geojson": {
            "type": "FeatureCollection",
            "features": {
                "type": "Feature",
                "properties": {
                    "spaceId": number, // id of room that has AP
                    "spaceName": string, // name of room that has AP
                    "bssids": {
                        "bssid": string,
                        "ssid": string
                    }[],
                    "description": string, // '-' if empty
                    "id": number
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [number, number] // lat-long format, NOT x-y
                }
            }[]
        }
    }
  ```

- 400 (Bad Request), 404 (Not Found), 500 (Internal Server Error)

```json
{
    "error": {
        "status": number, // 400, 404, 500,
        "message": string // example: Floor level does not exist
    }
}
```
