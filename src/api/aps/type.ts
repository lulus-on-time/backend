type AccessPointRequest = {
    type: string,
    features: {
        type: string,
        properties: {
            spaceId: number,
            bssids: {
                bssid: string,
                ssid: string,
            }[],
            description: string,
        },
        geometry: {
            type: string,
            coordinates: number[],
        },
    }[],
}

export default AccessPointRequest;