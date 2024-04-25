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
            id: number | undefined,
        },
        geometry: {
            type: string,
            coordinates: number[],
        },
    }[],
}

export default AccessPointRequest;