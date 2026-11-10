import { RootDocument, metadataFor } from "@/components/page/RootDocument";

export { viewport } from "@/components/page/RootDocument";
export const metadata = metadataFor("ru");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="ru">{children}</RootDocument>;
}
