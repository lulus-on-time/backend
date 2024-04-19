## Api Documentation

### Rooms

<details>
<summary><code>GET</code> <code><b>/floors/{floorId}</b></code> <code>(Get Rooms per floor)</code></summary>

##### Path Parameters

- floorId (required) [int] Id of floor to get all rooms from

##### Responses

- 200 (OK) [floor information including max coordinates + geojson of floor with id properties included]

  ```json
  {
    "floor": {
      "name": "Floor X",
      "id": 1,
      "level": 0,
      "maxX": 702.267546,
      "maxY": 576.730794
    },
    "geojson": {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {
            "name": "Room ABC",
            "poi": [475.7370116745971, 402.2121372031662],
            "category": "room",
            "id": 1
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [302.159367, 375.773586],
                [302.159367, 575.700438],
                [502.264908, 575.700438],
                [502.264908, 375.773586],
                [302.159367, 375.773586]
              ]
            ]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "name": "Room Y",
            "poi": [475.7190904799454, 601.714511873351],
            "category": "room",
            "id": 2
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [501.161478, 375.755664],
                [501.161478, 575.682517],
                [702.267546, 575.682517],
                [702.267546, 375.755664],
                [501.161478, 375.755664]
              ]
            ]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "name": "Koridor X",
            "poi": [154.9981713066682, 48.92084432717678],
            "category": "corridor",
            "id": 3
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [302.145119, 300.807233],
                [302.145119, 225.834664],
                [101.03905, 226.834298],
                [101.03905, 75.889525],
                [202.092348, 76.889159],
                [200.091293, 125.871238],
                [301.144591, 125.871238],
                [301.144591, 75.889525],
                [402.197889, 75.889525],
                [401.197361, 50.898668],
                [201.091821, 51.898302],
                [201.091821, -0.082679],
                [-4.016359, -2.081948],
                [0.98628, 301.806868],
                [302.145119, 300.807233]
              ]
            ]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "name": "Room A",
            "poi": [438.7812660532264, 151.6585751978892],
            "category": "room",
            "id": 4
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [1.079156, 300.831738],
                [1.079156, 576.730794],
                [302.237995, 576.730794],
                [302.237995, 300.831738],
                [1.079156, 300.831738]
              ]
            ]
          }
        }
      ]
    }
  }
  ```

  - 404 (Not Found) [No Floor with floorId found]

  ```json
  {
    "error": {
      "status": 404,
      "message": "Floor Level Does Not Exist"
    }
  }
  ```

</details>

<details>
<summary><code>POST</code> <code><b>/floors/create</b></code> <code>(Create Rooms per floor)</code></summary>

##### Request Body

- json [floor name and level + geojson of floor]

  ```json
  {
    "floor": {
      "level": 0,
      "name": "ABCD"
    },
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "category": "room",
          "name": "Room ABC",
          "poi": [475.73701167459706, 402.2121372031662]
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [302.159367, 375.773586],
              [302.159367, 575.700438],
              [502.264908, 575.700438],
              [502.264908, 375.773586],
              [302.159367, 375.773586]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "category": "room",
          "name": "DEFG",
          "poi": [475.7190904799454, 601.714511873351]
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [501.161478, 375.755664],
              [501.161478, 575.682517],
              [702.267546, 575.682517],
              [702.267546, 375.755664],
              [501.161478, 375.755664]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "category": "corridor",
          "name": "Corridor XYZ",
          "poi": [154.9981713066682, 48.92084432717678]
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [302.145119, 300.807233],
              [302.145119, 225.834664],
              [101.03905, 226.834298],
              [101.03905, 75.889525],
              [202.092348, 76.889159],
              [200.091293, 125.871238],
              [301.144591, 125.871238],
              [301.144591, 75.889525],
              [402.197889, 75.889525],
              [401.197361, 50.898668],
              [201.091821, 51.898302],
              [201.091821, -0.082679],
              [-4.016359, -2.081948],
              [0.98628, 301.806868],
              [302.145119, 300.807233]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "category": "room",
          "name": "Auditorium",
          "poi": [438.78126605322643, 151.65857519788918]
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [1.079156, 300.831738],
              [1.079156, 576.730794],
              [302.237995, 576.730794],
              [302.237995, 300.831738],
              [1.079156, 300.831738]
            ]
          ]
        }
      }
    ]
  }
  ```

##### Response

- 200 (OK) [No Response Body]
- 400 (Bad Request) [Attempt to add floor level that already exists]
  ```json
  {
    "error": {
      "status": 400,
      "message": "Floor level exists"
    }
  }
  ```
- 500 (Internal Server Error) [Unknown error not yet handled]

  <code>Unknown Error Ocurred</code>

</details>

<details>
<summary><code>GET</code> <code><b>/floors/short</b></code> <code>(Get short information on all floors)</code></summary>

##### Parameters

- No Parameters

##### Response Body

- 200 (OK) [json of short information on all floors]
  ```json
  [
    {
      "id": 1,
      "level": 0,
      "name": "ABCD"
    }
  ]
  ```
  </details>

<details>
<summary><code>DELETE</code> <code><b>/floors/{floorId}</b></code> <code>(Delete All Access Point in a Floor)</code></summary>

##### Path Parameters

- floorId (required) [int] Id of floor to get all rooms from

##### Response

- 200 (OK) [No Response Body]
- 404 (Not Found) [No floor with floorId]
  ```json
  {
    "error": {
      "status": 404,
      "message": "Floor Level Does Not Exist"
    }
  }
  ```

</details>

### Access Point

<details><summary><code>POST</code> <code><b>/aps/create</b></code> <code>(Create Access Point per floor)</code></summary>

##### Request Body

- json [geojson of access points in a floor, with spaceId referring to the roomId (room or corridor) that an access point is in]
  ```json
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "spaceId": 2,
          "bssids": [
            {
              "ssid": "Wifi",
              "bssid": "AB:CD:EF:12:34:5F"
            },
            {
              "ssid": "Wifi",
              "bssid": "AB:CD:EF:12:34:60"
            }
          ],
          "description": "Sebelah Kanan Pintu"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [288.056992, 766.988323]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "spaceId": 3,
          "bssids": [
            {
              "ssid": "Wifi",
              "bssid": "AB:CD:EF:12:34:61"
            },
            {
              "ssid": "Wifi",
              "bssid": "AB:CD:EF:12:34:62"
            }
          ],
          "description": "Sebelah Kiri Pintu"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [400.056992, 750.988323]
        }
      }
    ]
  }
  ```

##### Response

- 200 (OK) [No Response Body]
- 400 (Bad Request) [Duplicate BSSID Input]
  ```json
  {
    "status": 400,
    "message": "Attempting to create a network with BSSID that already exists"
  }
  ```
- 500 (Internal Server Error) [Unknown error not yet handled]

  <code>Unknown Error Ocurred</code>

</details>

<details>
<summary><code>GET</code> <code><b>/aps</b></code> <code>(Get all access points in the system)</code></summary>

##### Parameters

- No Parameters

##### Response Body

- 200 (OK) [array of access points information for table view]

  - Key represents id of access point
  - each access point keeps information on the floor it is located in such as floor id, name, level, and the total access point in that floor
  - each access point object keeps the room / corridor it is located in

  Response Example:

  ```json
  [
    {
      "key": 1,
      "floor": {
        "id": 1,
        "name": "ABCD",
        "level": 0,
        "apTotal": 2
      },
      "locationName": "DEFG"
    },
    {
      "key": 2,
      "floor": {
        "id": 1,
        "name": "ABCD",
        "level": 0,
        "apTotal": 2
      },
      "locationName": "Corridor XYZ"
    }
  ]
  ```

</details>

<details>
<summary><code>GET</code> <code><b>/aps/{floorId}</b></code> <code>(Get all access points in a floor)</code></summary>

##### Path Parameters

- floorId (required) [int] Id of floor to get all access points from

##### Query Parameters

- type (optional) (defaults to table)

  - table
    - 200 (OK)
      ```json
      {
          "floorName": "ABCD",
          "bssids": [
              {
                  "key": 1,
                  "apInfo": {
                      "id": 3,
                      "locationName": "Room ABC",
                      "description": "Sebelah Kanan Pintu",
                      "bssidTotal": 2
                  },
                  "ssid": "Wifi",
                  "bssid": "AB:CD:EF:12:34:5F"
              },
              {
                  "key": 2,
                  "apInfo": {
                      "id": 3,
                      "locationName": "Room ABC",
                      "description": "Sebelah Kanan Pintu",
                      "bssidTotal": 2
                  },
                  "ssid": "Wifi",
                  "bssid": "AB:CD:EF:12:34:60"
              },
              {
                  "key": 3,
                  "apInfo": {
                      "id": 4,
                      "locationName": "Room ABC",
                      "description": "Sebelah Kiri Pintu",
                      "bssidTotal": 2
                  },
                  "ssid": "Wifi",
                  "bssid": "AB:CD:EF:12:34:61"
              },
              {
                  "key": 4,
                  "apInfo": {
                      "id": 4,
                      "locationName": "Room ABC",
                      "description": "Sebelah Kiri Pintu",
                      "bssidTotal": 2
                  },
                  "ssid": "Wifi",
                  "bssid": "AB:CD:EF:12:34:62"
              },
              {
                  "key": 5,
                  "apInfo": {
                      "id": 6,
                      "locationName": "Room ABC",
                      "description": "",
                      "bssidTotal": 2
                  },
                  "ssid": "Wifi",
                  "bssid": "AB:CD:EF:12:34:70"
              },
              {
                  "key": 6,
                  "apInfo": {
                      "id": 6,
                      "locationName": "Room ABC",
                      "description": "",
                      "bssidTotal": 2
                  },
                  "ssid": "Wifi",
                  "bssid": "AB:CD:EF:12:34:71"
              },
              {
                  "key": 7,
                  "apInfo": {
                      "id": 7,
                      "locationName": "Room ABC",
                      "description": "Sebelah Kiri Pintu",
                      "bssidTotal": 2
                  },
                  "ssid": "Wifi",
                  "bssid": "AB:CD:EF:12:34:72"
              },
              {
                  "key": 8,
                  "apInfo": {
                      "id": 7,
                      "locationName": "Room ABC",
                      "description": "Sebelah Kiri Pintu",
                      "bssidTotal": 2
                  },
                  "ssid": "Wifi",
                  "bssid": "AB:CD:EF:12:34:73"
              }
          ]
      }
      ```
  - geojson
    - 200 (OK)

      ```json
      {
      "floor": {
        "id": 1,
        "name": "ABCD"
      },
      "geojson": {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "spaceId": 2,
              "spaceName": "DEFG",
              "bssids": [
                {
                  "bssid": "AB:CD:EF:12:34:5F",
                  "ssid": "Wifi"
                },
                {
                  "bssid": "AB:CD:EF:12:34:60",
                  "ssid": "Wifi"
                }
              ],
                "description": "Sebelah Kiri Pintu"
            },
            "geometry": {
              "type": "Point",
              "coordinates": [288.056992, 766.988323]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "spaceId": 3,
              "spaceName": "Corridor XYZ",
              "bssids": [
                {
                  "bssid": "AB:CD:EF:12:34:61",
                  "ssid": "Wifi"
                },
                {
                  "bssid": "AB:CD:EF:12:34:62",
                  "ssid": "Wifi"
                },
                "description": "Sebelah Kanan Pintu"
              ]
            },
            "geometry": {
              "type": "Point",
              "coordinates": [400.056992, 750.988323]
            }
          }
        ]
      }
      }
      ```
  </details>
