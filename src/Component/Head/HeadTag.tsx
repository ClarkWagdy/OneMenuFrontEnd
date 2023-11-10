import { strings } from "@/config/localization/LocalizedStrings";

interface Props{
    title:string,
    description:string,
    keywords:string,
}
export default function HeadTag(props:Props) {
  return (
        <>
        <title>{props.title}</title>
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />

      <meta name="description" content={props.description} />
      <meta name="keywords" content={ props.keywords } />
      <link rel="icon" href="/One.svg" />
      </>
  )
}
