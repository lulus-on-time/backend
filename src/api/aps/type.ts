type AccessPointRequest = {
    floorId: number,
    type: string,
    features: {
        type: string,
        properties: {
            spaceId: number,
            bssids: {
                bssid: string,
                ssid: string,
            }[],
        },
        geometry: {
            type: string,
            coordinates: number[],
        },
    }[],
}

export default AccessPointRequest;