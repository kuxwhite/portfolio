import { RootDocument, metadataFor } from "@/components/page/RootDocument";

export { viewport } from "@/components/page/RootDocument";
export const metadata = metadataFor("en");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
