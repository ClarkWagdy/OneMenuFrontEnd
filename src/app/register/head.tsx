import { strings } from "@/config/localization/LocalizedStrings";

 
export default function Head() {
  return (
    <>
       
       <title>{strings.register}</title>
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      {/* <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" /> */}

      <meta name="description" content="All in one chip" />
      <meta name="keywords" content="One card, NFC, nfc, chip" />
      <link rel="icon" href="/One.svg" />
  
    </>
  )
}
