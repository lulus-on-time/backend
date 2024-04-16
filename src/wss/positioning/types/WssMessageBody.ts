type WssMessageBody = {
    reason: string,
    npm: string | undefined,
    data: {
        fingerprints: {
            rssi: number,
            bssid: string,
        }[]
    }
}

export default WssMessageBody;