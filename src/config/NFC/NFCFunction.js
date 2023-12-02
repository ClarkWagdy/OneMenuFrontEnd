export const scan = async () => {
    if ("NDEFReader" in window) {
        try {
            const ndef = new window.NDEFReader();
            await ndef.scan();

            console.log("Scan started successfully.");
            ndef.onreadingerror = () => {
                console.log("Cannot read data from the NFC tag. Try another one?");
            };

            ndef.onreading = (event) => {
                console.log("NDEF message read.");
                onReading(event); //Find function below
            };
        } catch (error) {
            console.log(`Error! Scan failed to start: ${error}.`);
        }
    }
};

export const onWrite = async () => {
    try {
        const ndef = new window.NDEFReader();
        await ndef.write({
            records: [{ recordType: "text", data: "Hellow World!" }],
        });
        console.log(`Value Saved!`);
    } catch (error) {
        console.log(error);
    }
};