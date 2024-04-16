## Api Documentation

### Rooms

<details>
<summary><code>GET</code> <code><b>/floors</b></code> <code>(Get Rooms per floor)</code></summary>

##### Parameters

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

- 200 (OK) [List of room / corridor detailed saved in database]

```json
[
  {
    "id": 9,
    "name": "ABCD",
    "floorId": 3,
    "poiX": 475.7370116745971,
    "poiY": 402.2121372031662,
    "roomType": "room"
  },
  {
    "id": 10,
    "name": "EFGH",
    "floorId": 3,
    "poiX": 475.7190904799454,
    "poiY": 601.714511873351,
    "roomType": "room"
  },
  {
    "id": 11,
    "name": "HIJK",
    "floorId": 3,
    "poiX": 154.9981713066682,
    "poiY": 48.92084432717678,
    "roomType": "corridor"
  },
  {
    "id": 12,
    "name": "LMNOP",
    "floorId": 3,
    "poiX": 438.7812660532264,
    "poiY": 151.6585751978892,
    "roomType": "room"
  }
]
```

</details>

### Access Point
